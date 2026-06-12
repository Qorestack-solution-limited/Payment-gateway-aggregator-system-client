import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GatewayProvider, GatewayStatus, SettlementStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GatewayCredentialsService } from '../payments/gateway-credentials.service';

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger(SettlementsService.name);

  constructor(
    private prisma: PrismaService,
    private credentials: GatewayCredentialsService,
  ) {}

  findAll(orgId: string, params: { page?: number; limit?: number; gatewayId?: string; status?: SettlementStatus } = {}) {
    const { page = 1, limit = 20, gatewayId, status } = params;
    const where: any = { organizationId: orgId };
    if (gatewayId) where.gatewayId = gatewayId;
    if (status)    where.status = status;

    return Promise.all([
      this.prisma.settlement.findMany({
        where,
        include: { gateway: { select: { id: true, name: true, provider: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.settlement.count({ where }),
    ]).then(([data, total]) => ({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }));
  }

  async getSummary(orgId: string) {
    const [total, pending, completed] = await Promise.all([
      this.prisma.settlement.aggregate({ where: { organizationId: orgId }, _sum: { amount: true } }),
      this.prisma.settlement.aggregate({ where: { organizationId: orgId, status: SettlementStatus.PENDING }, _sum: { amount: true }, _count: true }),
      this.prisma.settlement.aggregate({ where: { organizationId: orgId, status: SettlementStatus.COMPLETED }, _sum: { amount: true }, _count: true }),
    ]);

    return {
      totalAmount:     Number(total._sum.amount ?? 0),
      pendingAmount:   Number(pending._sum.amount ?? 0),
      pendingCount:    pending._count,
      completedAmount: Number(completed._sum.amount ?? 0),
      completedCount:  completed._count,
    };
  }

  // Sync Paystack settlements every hour
  @Cron(CronExpression.EVERY_HOUR)
  async syncPaystackSettlements() {
    const gateways = await this.prisma.gateway.findMany({
      where: { provider: GatewayProvider.PAYSTACK, status: GatewayStatus.ACTIVE, secretKey: { not: null } },
    });

    for (const gw of gateways) {
      await this.fetchPaystackSettlements(gw).catch((e) =>
        this.logger.error(`Paystack settlement sync failed for ${gw.name}: ${e.message}`),
      );
    }
  }

  private async fetchPaystackSettlements(gw: any) {
    const secretKey = this.credentials.decrypt(gw.secretKey);
    if (!secretKey) return;

    const res = await fetch('https://api.paystack.co/settlement', {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) return;

    const json = await res.json() as { data?: any[] };
    const items = json.data ?? [];

    for (const item of items) {
      const providerId = String(item.id);
      const existing = await this.prisma.settlement.findFirst({
        where: { organizationId: gw.organizationId, providerSettlementId: providerId },
      });

      const status = item.status === 'success' ? SettlementStatus.COMPLETED
        : item.status === 'processing' ? SettlementStatus.PROCESSING
        : SettlementStatus.PENDING;

      const data = {
        gatewayId: gw.id,
        organizationId: gw.organizationId,
        providerSettlementId: providerId,
        amount: Number(item.total_amount ?? item.settled_amount ?? 0) / 100,
        currency: 'NGN',
        status,
        bankAccount: item.bank_account ? `${item.bank_account.account_number} (${item.bank_account.bank_name})` : null,
        settledAt: item.settled_at ? new Date(item.settled_at) : null,
        expectedAt: item.pay_date ? new Date(item.pay_date) : null,
        metadata: item as any,
      };

      if (existing) {
        await this.prisma.settlement.update({ where: { id: existing.id }, data });
      } else {
        await this.prisma.settlement.create({ data });
      }
    }

    this.logger.log(`Synced ${items.length} Paystack settlements for ${gw.name}`);
  }
}
