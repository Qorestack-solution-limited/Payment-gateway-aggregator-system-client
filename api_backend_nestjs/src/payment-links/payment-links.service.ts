import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export type CreatePaymentLinkDto = {
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  gatewayId?: string;
  redirectUrl?: string;
  maxUses?: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class PaymentLinksService {
  constructor(private prisma: PrismaService) {}

  private generateSlug() {
    return crypto.randomBytes(6).toString('hex');
  }

  findAll(orgId: string) {
    return this.prisma.paymentLink.findMany({
      where: { organizationId: orgId },
      include: { gateway: { select: { id: true, name: true, provider: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const link = await this.prisma.paymentLink.findUnique({
      where: { id },
      include: { gateway: { select: { id: true, name: true, provider: true } } },
    });
    if (!link) throw new NotFoundException('Payment link not found');
    if (link.organizationId !== orgId) throw new ForbiddenException();
    return link;
  }

  async findBySlug(slug: string) {
    const link = await this.prisma.paymentLink.findUnique({
      where: { slug },
      include: {
        gateway: { select: { id: true, name: true, provider: true, status: true } },
        organization: { select: { id: true, name: true } },
      },
    });
    if (!link) throw new NotFoundException('Payment link not found');
    if (!link.isActive) throw new BadRequestException('This payment link is no longer active');
    if (link.expiresAt && link.expiresAt < new Date()) throw new BadRequestException('This payment link has expired');
    if (link.maxUses != null && link.useCount >= link.maxUses) throw new BadRequestException('This payment link has reached its usage limit');
    return link;
  }

  async create(orgId: string, dto: CreatePaymentLinkDto) {
    const slug = this.generateSlug();
    return this.prisma.paymentLink.create({
      data: {
        slug,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency ?? 'NGN',
        gatewayId: dto.gatewayId,
        organizationId: orgId,
        redirectUrl: dto.redirectUrl,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        metadata: dto.metadata as any,
      },
      include: { gateway: { select: { id: true, name: true, provider: true } } },
    });
  }

  async update(id: string, orgId: string, dto: Partial<CreatePaymentLinkDto> & { isActive?: boolean }) {
    await this.findOne(id, orgId);
    return this.prisma.paymentLink.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.gatewayId !== undefined && { gatewayId: dto.gatewayId }),
        ...(dto.redirectUrl !== undefined && { redirectUrl: dto.redirectUrl }),
        ...(dto.maxUses !== undefined && { maxUses: dto.maxUses }),
        ...(dto.expiresAt !== undefined && { expiresAt: new Date(dto.expiresAt) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as any }),
      },
      include: { gateway: { select: { id: true, name: true, provider: true } } },
    });
  }

  async remove(id: string, orgId: string) {
    await this.findOne(id, orgId);
    await this.prisma.paymentLink.delete({ where: { id } });
    return { message: 'Payment link deleted' };
  }

  async incrementUseCount(id: string) {
    return this.prisma.paymentLink.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    });
  }
}
