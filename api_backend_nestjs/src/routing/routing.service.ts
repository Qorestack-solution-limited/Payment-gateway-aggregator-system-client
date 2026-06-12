import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GatewayStatus, RoutingStrategy, TransactionStatus } from '@prisma/client';

export type CreateRoutingRuleDto = {
  name: string;
  priority?: number;
  strategy?: RoutingStrategy;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  gatewayId?: string;
  fallbackGatewayId?: string;
};

@Injectable()
export class RoutingService {
  constructor(private prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.routingRule.findMany({
      where: { organizationId: orgId },
      include: {
        gateway: { select: { id: true, name: true, provider: true, status: true } },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const rule = await this.prisma.routingRule.findUnique({
      where: { id },
      include: { gateway: { select: { id: true, name: true, provider: true, status: true } } },
    });
    if (!rule || rule.organizationId !== orgId) throw new NotFoundException('Routing rule not found');
    return rule;
  }

  create(orgId: string, dto: CreateRoutingRuleDto) {
    return this.prisma.routingRule.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        priority: dto.priority ?? 0,
        strategy: dto.strategy ?? RoutingStrategy.PRIORITY,
        currency: dto.currency,
        minAmount: dto.minAmount,
        maxAmount: dto.maxAmount,
        gatewayId: dto.gatewayId,
        fallbackGatewayId: dto.fallbackGatewayId,
      },
      include: { gateway: { select: { id: true, name: true, provider: true, status: true } } },
    });
  }

  async update(id: string, orgId: string, dto: Partial<CreateRoutingRuleDto> & { isActive?: boolean }) {
    await this.findOne(id, orgId);
    return this.prisma.routingRule.update({
      where: { id },
      data: dto as any,
      include: { gateway: { select: { id: true, name: true, provider: true, status: true } } },
    });
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId);
    await this.prisma.routingRule.delete({ where: { id } });
    return { message: 'Routing rule deleted' };
  }

  /**
   * Resolve which gateway to use for a given transaction.
   * Returns the best gatewayId based on active rules, or null if none match.
   */
  async resolveGateway(orgId: string, opts: {
    amount: number;
    currency?: string;
  }): Promise<string | null> {
    const rules = await this.prisma.routingRule.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { priority: 'asc' },
    });

    const activeGateways = await this.prisma.gateway.findMany({
      where: { organizationId: orgId, status: GatewayStatus.ACTIVE },
    });

    if (activeGateways.length === 0) return null;

    for (const rule of rules) {
      // Filter by currency if specified
      if (rule.currency && rule.currency !== (opts.currency ?? 'NGN')) continue;
      // Filter by amount range if specified
      if (rule.minAmount != null && opts.amount < Number(rule.minAmount)) continue;
      if (rule.maxAmount != null && opts.amount > Number(rule.maxAmount)) continue;

      if (rule.strategy === RoutingStrategy.PRIORITY && rule.gatewayId) {
        const gw = activeGateways.find((g) => g.id === rule.gatewayId);
        if (gw) return gw.id;
        // Try fallback
        if (rule.fallbackGatewayId) {
          const fb = activeGateways.find((g) => g.id === rule.fallbackGatewayId);
          if (fb) return fb.id;
        }
      }

      if (rule.strategy === RoutingStrategy.SUCCESS_RATE) {
        const gwId = await this.getBestBySuccessRate(orgId, activeGateways.map((g) => g.id));
        if (gwId) return gwId;
      }

      if (rule.strategy === RoutingStrategy.ROUND_ROBIN) {
        const gwId = await this.getRoundRobin(orgId, activeGateways.map((g) => g.id));
        if (gwId) return gwId;
      }
    }

    // No rules matched — return the first active gateway
    return activeGateways[0]?.id ?? null;
  }

  private async getBestBySuccessRate(orgId: string, gatewayIds: string[]): Promise<string | null> {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour
    const stats = await Promise.all(
      gatewayIds.map(async (id) => {
        const [total, success] = await Promise.all([
          this.prisma.transaction.count({ where: { organizationId: orgId, gatewayId: id, createdAt: { gte: since } } }),
          this.prisma.transaction.count({ where: { organizationId: orgId, gatewayId: id, status: TransactionStatus.SUCCESS, createdAt: { gte: since } } }),
        ]);
        return { id, rate: total === 0 ? 1 : success / total };
      }),
    );
    stats.sort((a, b) => b.rate - a.rate);
    return stats[0]?.id ?? null;
  }

  private async getRoundRobin(orgId: string, gatewayIds: string[]): Promise<string | null> {
    // Pick the gateway with the fewest transactions in the last hour
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const counts = await Promise.all(
      gatewayIds.map(async (id) => ({
        id,
        count: await this.prisma.transaction.count({
          where: { organizationId: orgId, gatewayId: id, createdAt: { gte: since } },
        }),
      })),
    );
    counts.sort((a, b) => a.count - b.count);
    return counts[0]?.id ?? null;
  }
}
