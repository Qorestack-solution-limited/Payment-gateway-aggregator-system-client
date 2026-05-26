import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(orgId: string) {
    const from30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const from60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [txsCurrent, txsPrev, gateways, recentTxs] = await Promise.all([
      this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: from30 } } }),
      this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: from60, lt: from30 } } }),
      this.prisma.gateway.findMany({
        where: { organizationId: orgId },
        include: {
          transactions: {
            where: { status: TransactionStatus.SUCCESS, createdAt: { gte: from30 } },
            select: { amount: true },
          },
        },
      }),
      this.prisma.transaction.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { gateway: { select: { name: true } } },
      }),
    ]);

    const successCurr = txsCurrent.filter(t => t.status === TransactionStatus.SUCCESS);
    const successPrev = txsPrev.filter(t => t.status === TransactionStatus.SUCCESS);

    const revenue = successCurr.reduce((s, t) => s + Number(t.amount), 0);
    const prevRevenue = successPrev.reduce((s, t) => s + Number(t.amount), 0);

    const successRate = txsCurrent.length ? (successCurr.length / txsCurrent.length) * 100 : 0;
    const prevSuccessRate = txsPrev.length ? (successPrev.length / txsPrev.length) * 100 : 0;

    const activeCustomers = new Set(successCurr.map(t => t.customerEmail)).size;
    const prevActiveCustomers = new Set(successPrev.map(t => t.customerEmail)).size;

    const pct = (curr: number, prev: number) =>
      prev === 0 ? 100 : parseFloat((((curr - prev) / prev) * 100).toFixed(1));

    return {
      stats: {
        revenue: { value: revenue, change: pct(revenue, prevRevenue) },
        transactions: { value: txsCurrent.length, change: pct(txsCurrent.length, txsPrev.length) },
        successRate: { value: parseFloat(successRate.toFixed(1)), change: parseFloat((successRate - prevSuccessRate).toFixed(1)) },
        activeCustomers: { value: activeCustomers, change: pct(activeCustomers, prevActiveCustomers) },
      },
      gatewayPerformance: gateways.map(gw => ({
        id: gw.id,
        name: gw.name,
        provider: gw.provider,
        status: gw.status,
        uptime: gw.uptime,
        volume: gw.transactions.reduce((s, t) => s + Number(t.amount), 0),
        count: gw.transactions.length,
      })),
      recentTransactions: recentTxs,
    };
  }

  async getRevenueChart(orgId: string) {
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const txs = await this.prisma.transaction.findMany({
      where: { organizationId: orgId, status: TransactionStatus.SUCCESS, createdAt: { gte: from } },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    txs.forEach(tx => {
      const day = tx.createdAt.toISOString().split('T')[0];
      grouped[day] = (grouped[day] ?? 0) + Number(tx.amount);
    });

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
  }
}
