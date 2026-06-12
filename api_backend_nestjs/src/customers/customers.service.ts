import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, search?: string) {
    const where: any = { organizationId: orgId };
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Aggregate by customerEmail
    const raw = await this.prisma.transaction.groupBy({
      by: ['customerEmail', 'customerName'],
      where,
      _count: { _all: true },
      _sum: { amount: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
    });

    // For each unique email, get success / failed / pending counts
    const customers = await Promise.all(
      raw.map(async (row) => {
        const [success, failed, pending] = await Promise.all([
          this.prisma.transaction.count({ where: { organizationId: orgId, customerEmail: row.customerEmail, status: 'SUCCESS' } }),
          this.prisma.transaction.count({ where: { organizationId: orgId, customerEmail: row.customerEmail, status: 'FAILED' } }),
          this.prisma.transaction.count({ where: { organizationId: orgId, customerEmail: row.customerEmail, status: 'PENDING' } }),
        ]);

        return {
          email: row.customerEmail,
          name: row.customerName,
          totalTransactions: row._count._all,
          totalSpend: row._sum.amount ?? 0,
          lastSeen: row._max.createdAt,
          success,
          failed,
          pending,
        };
      }),
    );

    return customers;
  }

  async findOne(orgId: string, email: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { organizationId: orgId, customerEmail: email },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { gateway: { select: { name: true, provider: true } } },
    });

    if (!transactions.length) return null;

    const totalSpend = transactions
      .filter((tx) => tx.status === 'SUCCESS')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      email,
      name: transactions[0].customerName,
      totalTransactions: transactions.length,
      totalSpend,
      lastSeen: transactions[0].createdAt,
      transactions,
    };
  }
}
