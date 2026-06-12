import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGatewayDto, SyncGatewayTransactionsDto, UpdateGatewayDto } from './dto/gateway.dto';
import { GatewayStatus, TransactionStatus } from '@prisma/client';
import { PaymentGatewayRegistry } from '../payments/payment-gateway.registry';
import { GatewayCredentialsService } from '../payments/gateway-credentials.service';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class GatewaysService {
  constructor(
    private prisma: PrismaService,
    private registry: PaymentGatewayRegistry,
    private credentials: GatewayCredentialsService,
    private webhooks: WebhooksService,
    private audit: AuditService,
  ) {}

  private async assertOwnership(gatewayId: string, orgId: string) {
    const gw = await this.prisma.gateway.findUnique({ where: { id: gatewayId } });
    if (!gw) throw new NotFoundException('Gateway not found');
    if (gw.organizationId !== orgId) throw new ForbiddenException();
    return gw;
  }

  private serializeGateway(gateway: any) {
    const { secretKey, webhookSecret, ...rest } = gateway;
    return {
      ...rest,
      hasSecretKey: Boolean(secretKey),
      hasWebhookSecret: Boolean(webhookSecret),
    };
  }

  findAll(orgId: string) {
    return this.prisma.gateway.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    }).then((gateways) =>
      gateways.map((gateway) => ({
        ...this.serializeGateway(gateway),
        transactionCount: gateway._count.transactions,
      })),
    );
  }

  findOne(id: string, orgId: string) {
    return this.prisma.gateway.findFirst({
      where: { id, organizationId: orgId },
      include: {
        _count: {
          select: {
            transactions: true,
            providerWebhookEvents: true,
            syncRuns: true,
          },
        },
      },
    }).then((gateway) => {
      if (!gateway) throw new NotFoundException('Gateway not found');
      return {
        ...this.serializeGateway(gateway),
        transactionCount: gateway._count.transactions,
        webhookEventCount: gateway._count.providerWebhookEvents,
        syncRunCount: gateway._count.syncRuns,
      };
    });
  }

  async getWebhookEvents(id: string, orgId: string) {
    await this.assertOwnership(id, orgId);
    return this.prisma.providerWebhookEvent.findMany({
      where: { gatewayId: id, organizationId: orgId },
      orderBy: { receivedAt: 'desc' },
      take: 25,
      include: {
        transaction: {
          select: {
            id: true,
            reference: true,
            status: true,
            amount: true,
            currency: true,
          },
        },
      },
    });
  }

  async getSyncRuns(id: string, orgId: string) {
    await this.assertOwnership(id, orgId);
    return this.prisma.gatewaySyncRun.findMany({
      where: { gatewayId: id, organizationId: orgId },
      orderBy: { startedAt: 'desc' },
      take: 25,
    });
  }

  create(orgId: string, dto: CreateGatewayDto) {
    return this.prisma.gateway.create({
      data: { ...this.credentials.prepareCreateData(dto), organizationId: orgId },
    }).then((gateway) => ({
      ...this.serializeGateway(gateway),
      transactionCount: 0,
    }));
  }

  async validate(id: string, orgId: string) {
    const gateway = this.credentials.hydrateGateway(await this.assertOwnership(id, orgId));
    const adapter = this.registry.forGateway(gateway);
    return adapter.validateConfiguration(gateway);
  }

  async syncTransactions(id: string, orgId: string, dto: SyncGatewayTransactionsDto) {
    const gateway = this.credentials.hydrateGateway(await this.assertOwnership(id, orgId));
    const adapter = this.registry.forGateway(gateway);
    const startedAt = new Date();

    try {
      const providerTransactions = await adapter.fetchTransactions(gateway, dto);
      let imported = 0;
      let updated = 0;

      for (const item of providerTransactions) {
        const statusMap: Record<string, TransactionStatus> = {
          success: TransactionStatus.SUCCESS,
          failed: TransactionStatus.FAILED,
          abandoned: TransactionStatus.FAILED,
          pending: TransactionStatus.PENDING,
          processing: TransactionStatus.PENDING,
          refunded: TransactionStatus.REFUNDED,
        };
        const normalizedStatus = statusMap[String(item.providerStatus ?? '').toLowerCase()] ?? TransactionStatus.PENDING;
        const existing = await this.prisma.transaction.findFirst({
          where: {
            organizationId: orgId,
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
              providerReference: item.providerReference,
              providerTransactionId: item.providerTransactionId,
              providerStatus: item.providerStatus,
              providerPayload: item.raw as any,
              amount: item.amount,
              currency: item.currency,
              customerName: item.customerName,
              customerEmail: item.customerEmail,
              description: item.description,
              metadata: item.metadata as any,
              status: normalizedStatus,
              syncedFromProvider: true,
              lastSyncedAt: new Date(),
            },
          });
          updated += 1;
          continue;
        }

        await this.prisma.transaction.create({
          data: {
            reference: item.reference,
            providerReference: item.providerReference,
            providerTransactionId: item.providerTransactionId,
            providerStatus: item.providerStatus,
            providerPayload: item.raw as any,
            amount: item.amount,
            currency: item.currency,
            customerName: item.customerName,
            customerEmail: item.customerEmail,
            description: item.description,
            metadata: item.metadata as any,
            gatewayId: gateway.id,
            organizationId: orgId,
            status: normalizedStatus,
            syncedFromProvider: true,
            lastSyncedAt: new Date(),
          },
        });
        imported += 1;
      }

      await this.prisma.gateway.update({
        where: { id: gateway.id },
        data: {
          lastSyncedAt: new Date(),
          lastSyncStatus: 'SUCCESS',
          lastSyncMessage: `Imported ${imported}, updated ${updated}`,
        },
      });

      await this.prisma.gatewaySyncRun.create({
        data: {
          gatewayId: gateway.id,
          organizationId: orgId,
          status: 'SUCCESS',
          imported,
          updated,
          totalFetched: providerTransactions.length,
          message: `Imported ${imported}, updated ${updated}`,
          fromDate: dto.from,
          toDate: dto.to,
          startedAt,
          completedAt: new Date(),
        },
      });

      await this.webhooks.dispatchEvent(orgId, 'gateway.sync.completed', {
        gatewayId: gateway.id,
        gatewayName: gateway.name,
        imported,
        updated,
      });

      return {
        gatewayId: gateway.id,
        imported,
        updated,
        totalFetched: providerTransactions.length,
        message: `Imported ${imported} and updated ${updated} transaction(s) from ${gateway.name}.`,
      };
    } catch (error) {
      await this.prisma.gateway.update({
        where: { id: gateway.id },
        data: {
          lastSyncedAt: new Date(),
          lastSyncStatus: 'FAILED',
          lastSyncMessage: error instanceof Error ? error.message : 'Sync failed',
        },
      });
      await this.prisma.gatewaySyncRun.create({
        data: {
          gatewayId: gateway.id,
          organizationId: orgId,
          status: 'FAILED',
          imported: 0,
          updated: 0,
          totalFetched: 0,
          message: error instanceof Error ? error.message : 'Sync failed',
          fromDate: dto.from,
          toDate: dto.to,
          startedAt,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }

  async update(id: string, orgId: string, dto: UpdateGatewayDto) {
    await this.assertOwnership(id, orgId);
    return this.prisma.gateway
      .update({ where: { id }, data: this.credentials.prepareUpdateData(dto) })
      .then((gateway) => this.serializeGateway(gateway));
  }

  async toggleStatus(id: string, orgId: string, actorId?: string, actorEmail?: string) {
    const gw = await this.assertOwnership(id, orgId);
    const next = gw.status === GatewayStatus.ACTIVE ? GatewayStatus.INACTIVE : GatewayStatus.ACTIVE;
    const updated = await this.prisma.gateway
      .update({ where: { id }, data: { status: next } })
      .then((gateway) => this.serializeGateway(gateway));

    if (actorId && actorEmail) {
      this.audit.log({
        action: AuditAction.GATEWAY_TOGGLED,
        actorId, actorEmail, organizationId: orgId,
        resourceType: 'gateway', resourceId: id,
        description: `Gateway "${gw.name}" toggled to ${next}`,
        before: { status: gw.status }, after: { status: next },
      }).catch(() => {});
    }

    return updated;
  }

  async remove(id: string, orgId: string, actorId?: string, actorEmail?: string) {
    const gw = await this.assertOwnership(id, orgId);
    await this.prisma.gateway.delete({ where: { id } });

    if (actorId && actorEmail) {
      this.audit.log({
        action: AuditAction.GATEWAY_DELETED,
        actorId, actorEmail, organizationId: orgId,
        resourceType: 'gateway', resourceId: id,
        description: `Gateway "${gw.name}" deleted`,
      }).catch(() => {});
    }

    return { message: 'Gateway removed' };
  }
}
