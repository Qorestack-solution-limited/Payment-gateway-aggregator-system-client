import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private fx: ExchangeRatesService,
  ) {}

  private async getBaseCurrency(orgId: string): Promise<string> {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId }, select: { baseCurrency: true } });
    return org?.baseCurrency ?? 'NGN';
  }

  private normalizeRevenue(txs: any[], baseCurrency: string): number {
    return txs
      .filter(t => t.status === TransactionStatus.SUCCESS)
      .reduce((sum, t) => sum + this.fx.convert(Number(t.amount), t.currency ?? baseCurrency, baseCurrency), 0);
  }

  async getSummary(orgId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const prevFrom = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);
    const baseCurrency = await this.getBaseCurrency(orgId);

    const [current, previous] = await Promise.all([
      this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: from } } }),
      this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: prevFrom, lt: from } } }),
    ]);

    const success = (txs: any[]) => txs.filter(t => t.status === TransactionStatus.SUCCESS);
    const revenue = (txs: any[]) => this.normalizeRevenue(txs, baseCurrency);

    const currRevenue = revenue(current);
    const prevRevenue = revenue(previous);
    const revenueChange = prevRevenue === 0 ? 100 : ((currRevenue - prevRevenue) / prevRevenue) * 100;

    const currSuccess = success(current).length;
    const prevSuccess = success(previous).length;

    const successRate = current.length === 0 ? 0 : (currSuccess / current.length) * 100;
    const prevSuccessRate = previous.length === 0 ? 0 : (prevSuccess / previous.length) * 100;

    const activeCustomers = new Set(success(current).map(t => t.customerEmail)).size;
    const prevActiveCustomers = new Set(success(previous).map(t => t.customerEmail)).size;

    return {
      revenue: { value: currRevenue, change: revenueChange },
      transactions: { value: current.length, change: previous.length === 0 ? 100 : ((current.length - previous.length) / previous.length) * 100 },
      successRate: { value: successRate, change: successRate - prevSuccessRate },
      activeCustomers: { value: activeCustomers, change: prevActiveCustomers === 0 ? 100 : ((activeCustomers - prevActiveCustomers) / prevActiveCustomers) * 100 },
    };
  }

  async getRevenueChart(orgId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const baseCurrency = await this.getBaseCurrency(orgId);
    const txs = await this.prisma.transaction.findMany({
      where: { organizationId: orgId, status: TransactionStatus.SUCCESS, createdAt: { gte: from } },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    txs.forEach(tx => {
      const day = tx.createdAt.toISOString().split('T')[0];
      const normalized = this.fx.convert(Number(tx.amount), tx.currency ?? baseCurrency, baseCurrency);
      grouped[day] = (grouped[day] ?? 0) + normalized;
    });

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue, currency: baseCurrency }));
  }

  async getGatewayBreakdown(orgId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const gateways = await this.prisma.gateway.findMany({
      where: { organizationId: orgId },
      include: {
        transactions: {
          where: { status: TransactionStatus.SUCCESS, createdAt: { gte: from } },
        },
      },
    });

    return gateways.map(gw => ({
      name: gw.name,
      provider: gw.provider,
      volume: gw.transactions.reduce((s, t) => s + Number(t.amount), 0),
      count: gw.transactions.length,
    }));
  }

  async getKPIs(orgId: string, days = 30) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const txs = await this.prisma.transaction.findMany({
      where: { organizationId: orgId, createdAt: { gte: from } },
    });

    const success = txs.filter(t => t.status === TransactionStatus.SUCCESS);
    const refunded = txs.filter(t => t.status === TransactionStatus.REFUNDED);
    const totalRevenue = success.reduce((s, t) => s + Number(t.amount), 0);
    const avgTxValue = success.length === 0 ? 0 : totalRevenue / success.length;
    const refundRate = txs.length === 0 ? 0 : (refunded.length / txs.length) * 100;
    const authRate = txs.length === 0 ? 0 : (success.length / txs.length) * 100;

    return { avgTransactionValue: avgTxValue, refundRate, authorizationRate: authRate };
  }
}
