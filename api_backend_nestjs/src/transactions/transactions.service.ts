import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, QueryTransactionDto } from './dto/transaction.dto';
import { GatewayStatus, TransactionStatus } from '@prisma/client';
import { createHash } from 'crypto';
import { WebhooksService } from '../webhooks/webhooks.service';
import { PaymentGatewayRegistry } from '../payments/payment-gateway.registry';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private webhooks: WebhooksService,
    private gateways: PaymentGatewayRegistry,
  ) {}

  private hashRequest(orgId: string, dto: CreateTransactionDto) {
    return createHash('sha256').update(JSON.stringify({ orgId, dto })).digest('hex');
  }

  async findAll(orgId: string, query: QueryTransactionDto) {
    const { page = 1, limit = 20, search, status, gatewayId, provider, from, to } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId: orgId };
    if (status) where.status = status;
    if (gatewayId) where.gatewayId = gatewayId;
    if (provider) {
      where.gateway = {
        provider,
      };
    }
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { gateway: { select: { name: true, provider: true } } },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, orgId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: { gateway: true },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.organizationId !== orgId) throw new ForbiddenException();
    return tx;
  }

  async findByReference(reference: string, orgId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { reference, organizationId: orgId },
      include: { gateway: true },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async create(orgId: string, dto: CreateTransactionDto, idempotencyKey?: string) {
    const requestHash = idempotencyKey ? this.hashRequest(orgId, dto) : null;

    if (idempotencyKey) {
      const existing = await this.prisma.idempotencyRequest.findUnique({
        where: {
          organizationId_key_path: {
            organizationId: orgId,
            key: idempotencyKey,
            path: '/transactions',
          },
        },
      });

      if (existing) {
        if (existing.requestHash !== requestHash) {
          throw new ConflictException('Idempotency key has already been used with a different payload');
        }
        return existing.response;
      }
    }

    const gateway = await this.prisma.gateway.findFirst({
      where: { id: dto.gatewayId, organizationId: orgId, status: GatewayStatus.ACTIVE },
    });
    if (!gateway) throw new NotFoundException('Gateway not found');

    const reference = dto.reference || cryptoRandomReference();
    const adapter = this.gateways.forGateway(gateway);
    const initialized = await adapter.initializePayment(gateway, {
      amount: dto.amount,
      currency: dto.currency,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      description: dto.description,
      reference,
      metadata: dto.metadata,
    });

    const created = await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        currency: dto.currency ?? 'NGN',
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        description: dto.description,
        reference: initialized.reference || reference,
        providerReference: initialized.providerReference,
        providerTransactionId: initialized.providerTransactionId,
        providerStatus: initialized.providerStatus,
        providerPayload: initialized.raw as any,
        metadata: {
          ...(dto.metadata ?? {}),
          checkoutUrl: initialized.checkoutUrl,
          accessCode: initialized.accessCode,
        } as any,
        gatewayId: dto.gatewayId,
        organizationId: orgId,
      },
      include: { gateway: true },
    });

    if (idempotencyKey && requestHash) {
      await this.prisma.idempotencyRequest.create({
        data: {
          organizationId: orgId,
          key: idempotencyKey,
          path: '/transactions',
          requestHash,
          response: JSON.parse(JSON.stringify({
            ...created,
            checkoutUrl: initialized.checkoutUrl,
            accessCode: initialized.accessCode,
          })),
        },
      });
    }

    await this.webhooks.dispatchEvent(orgId, 'payment.created', created);

    return {
      ...created,
      checkoutUrl: initialized.checkoutUrl,
      accessCode: initialized.accessCode,
    };
  }

  async verify(id: string, orgId: string) {
    const tx = await this.findOne(id, orgId);
    const adapter = this.gateways.forGateway(tx.gateway);
    const verified = await adapter.verifyPayment(tx.gateway, tx.providerReference || tx.reference);

    const statusMap: Record<string, TransactionStatus> = {
      success: TransactionStatus.SUCCESS,
      failed: TransactionStatus.FAILED,
      abandoned: TransactionStatus.FAILED,
      pending: TransactionStatus.PENDING,
      processing: TransactionStatus.PENDING,
      refunded: TransactionStatus.REFUNDED,
    };
    const nextStatus = statusMap[String(verified.providerStatus ?? '').toLowerCase()] ?? tx.status;

    const updated = await this.prisma.transaction.update({
      where: { id: tx.id },
      data: {
        reference: verified.reference || tx.reference,
        providerReference: verified.providerReference,
        providerTransactionId: verified.providerTransactionId,
        providerStatus: verified.providerStatus,
        providerPayload: verified.raw as any,
        status: nextStatus,
        amount: verified.amount ?? tx.amount,
        currency: verified.currency ?? tx.currency,
        customerName: verified.customerName ?? tx.customerName,
        customerEmail: verified.customerEmail ?? tx.customerEmail,
        lastSyncedAt: new Date(),
      },
      include: { gateway: true },
    });

    await this.webhooks.dispatchEvent(orgId, `payment.${nextStatus.toLowerCase()}`, {
      previousStatus: tx.status,
      transaction: updated,
    });

    return updated;
  }

  async updateStatus(id: string, orgId: string, status: TransactionStatus) {
    const tx = await this.findOne(id, orgId);
    const updated = await this.prisma.transaction.update({ where: { id }, data: { status } });
    await this.webhooks.dispatchEvent(orgId, `payment.${status.toLowerCase()}`, {
      previousStatus: tx.status,
      transaction: updated,
    });
    return updated;
  }
}

function cryptoRandomReference() {
  return `txn_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
}
