import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  findAll(orgId: string) {
    return this.prisma.apiKey.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, type: true, isActive: true, lastUsedAt: true, requestCount: true, createdAt: true, key: true },
    });
  }

  async generate(orgId: string, name: string, type: ApiKeyType) {
    const prefix = type === ApiKeyType.LIVE ? 'pk_live_' : 'pk_test_';
    const raw = crypto.randomBytes(24).toString('hex');
    const key = `${prefix}${raw}`;

    return this.prisma.apiKey.create({
      data: { name, key, type, organizationId: orgId },
    });
  }

  async revoke(id: string, orgId: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) throw new NotFoundException('API key not found');
    if (apiKey.organizationId !== orgId) throw new ForbiddenException();

    return this.prisma.apiKey.update({ where: { id }, data: { isActive: false } });
  }

  async remove(id: string, orgId: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) throw new NotFoundException('API key not found');
    if (apiKey.organizationId !== orgId) throw new ForbiddenException();

    await this.prisma.apiKey.delete({ where: { id } });
    return { message: 'API key deleted' };
  }
}
