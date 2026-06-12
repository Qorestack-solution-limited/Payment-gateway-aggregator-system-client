import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GatewayStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GatewayCredentialsService } from '../payments/gateway-credentials.service';
import { PaymentGatewayRegistry } from '../payments/payment-gateway.registry';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class SyncSchedulerService {
  private readonly logger = new Logger(SyncSchedulerService.name);
  private running = false;

  constructor(
    private prisma: PrismaService,
    private credentials: GatewayCredentialsService,
    private registry: PaymentGatewayRegistry,
    private webhooks: WebhooksService,
  ) {}

  // Retry failed webhook deliveries every 5 minutes
  @Cron('*/5 * * * *')
  async retryFailedWebhooks() {
    this.logger.debug('Running webhook retry job');
    await this.webhooks.scheduleFailedRetries().catch((e) =>
      this.logger.error(`Webhook retry job failed: ${e.message}`),
    );
  }

  // Purge old idempotency keys (older than 30 days) nightly
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeOldIdempotencyKeys() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.idempotencyRequest.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (count > 0) this.logger.log(`Purged ${count} expired idempotency keys`);
  }

  // Run every 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async syncAllActiveGateways() {
    if (this.running) {
      this.logger.warn('Sync already in progress, skipping');
      return;
    }
    this.running = true;
    this.logger.log('Starting scheduled gateway sync');

    try {
      const gateways = await this.prisma.gateway.findMany({
        where: { status: GatewayStatus.ACTIVE },
      });

      this.logger.log(`Syncing ${gateways.length} active gateways`);

      for (const gw of gateways) {
        await this.syncGateway(gw).catch((err) =>
          this.logger.error(`Sync failed for gateway ${gw.id} (${gw.name}): ${err.message}`),
        );
      }
    } finally {
      this.running = false;
      this.logger.log('Scheduled gateway sync complete');
    }
  }

  private async syncGateway(gateway: any) {
    const hydrated = this.credentials.hydrateGateway(gateway);
    const adapter = this.registry.forGateway(hydrated);

    // Sync last 24 hours
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const to   = new Date().toISOString().slice(0, 10);

    const syncRun = await this.prisma.gatewaySyncRun.create({
      data: {
        gatewayId: gateway.id,
        organizationId: gateway.organizationId,
        status: 'RUNNING',
        fromDate: from,
        toDate: to,
      },
    });

    try {
      const transactions = await adapter.fetchTransactions(hydrated, { from, to, perPage: 200 });
      let imported = 0;
      let updated  = 0;

      const statusMap: Record<string, TransactionStatus> = {
        success:    TransactionStatus.SUCCESS,
        failed:     TransactionStatus.FAILED,
        abandoned:  TransactionStatus.FAILED,
        pending:    TransactionStatus.PENDING,
        processing: TransactionStatus.PENDING,
        refunded:   TransactionStatus.REFUNDED,
      };

      for (const item of transactions) {
        const normalizedStatus = statusMap[String(item.providerStatus ?? '').toLowerCase()] ?? TransactionStatus.PENDING;
        const existing = await this.prisma.transaction.findFirst({
          where: {
            organizationId: gateway.organizationId,
            OR: [
              { reference: item.reference },
              item.providerTransactionId ? { providerTransactionId: item.providerTransactionId } : undefined,
            ].filter(Boolean) as any,
          },
        });

        if (existing) {
          await this.prisma.transaction.update({
            where: { id: existing.id },
            data: {
              status: normalizedStatus,
              providerReference: item.providerReference,
              providerTransactionId: item.providerTransactionId,
              providerStatus: item.providerStatus,
              providerPayload: item.raw as any,
              syncedFromProvider: true,
              lastSyncedAt: new Date(),
            },
          });
          updated++;
        } else {
          await this.prisma.transaction.create({
            data: {
              organizationId: gateway.organizationId,
              gatewayId: gateway.id,
              reference: item.reference,
              providerReference: item.providerReference ?? item.reference,
              providerTransactionId: item.providerTransactionId,
              providerStatus: item.providerStatus,
              providerPayload: item.raw as any,
              syncedFromProvider: true,
              lastSyncedAt: new Date(),
              amount: item.amount || 0,
              currency: item.currency ?? 'NGN',
              customerName: item.customerName || 'Customer',
              customerEmail: item.customerEmail || '',
              description: item.description,
              metadata: (item.metadata ?? {}) as any,
              status: normalizedStatus,
            },
          });
          imported++;
        }
      }

      await this.prisma.gatewaySyncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'SUCCESS',
          imported,
          updated,
          totalFetched: transactions.length,
          completedAt: new Date(),
          message: `Imported ${imported}, updated ${updated} of ${transactions.length}`,
        },
      });

      await this.prisma.gateway.update({
        where: { id: gateway.id },
        data: {
          lastSyncedAt: new Date(),
          lastSyncStatus: 'SUCCESS',
          lastSyncMessage: `Auto-sync: ${imported} new, ${updated} updated`,
        },
      });

      this.logger.log(`Gateway ${gateway.name}: imported ${imported}, updated ${updated}`);
    } catch (err: any) {
      await this.prisma.gatewaySyncRun.update({
        where: { id: syncRun.id },
        data: { status: 'FAILED', completedAt: new Date(), message: err.message },
      });
      await this.prisma.gateway.update({
        where: { id: gateway.id },
        data: { lastSyncStatus: 'FAILED', lastSyncMessage: err.message },
      });
      throw err;
    }
  }
}
