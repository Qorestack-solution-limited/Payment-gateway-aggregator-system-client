import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(orgId: string, q: string) {
    if (!q || q.trim().length < 2) {
      return { transactions: [], gateways: [] };
    }

    const term = q.trim();

    const [transactions, gateways] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { reference: { contains: term, mode: 'insensitive' } },
            { customerName: { contains: term, mode: 'insensitive' } },
            { customerEmail: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reference: true,
          customerName: true,
          customerEmail: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.gateway.findMany({
        where: {
          organizationId: orgId,
          name: { contains: term, mode: 'insensitive' },
        },
        take: 5,
        select: {
          id: true,
          name: true,
          provider: true,
          status: true,
        },
      }),
    ]);

    return { transactions, gateways };
  }
}
