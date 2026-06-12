import { Injectable } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type AuditLogInput = {
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  organizationId: string;
  resourceType: string;
  resourceId?: string;
  description?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
};

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(input: AuditLogInput) {
    return this.prisma.auditLog.create({ data: input as any });
  }

  findAll(orgId: string, options: { page?: number; limit?: number; resourceType?: string; actorId?: string } = {}) {
    const { page = 1, limit = 30, resourceType, actorId } = options;
    const where: any = { organizationId: orgId };
    if (resourceType) where.resourceType = resourceType;
    if (actorId)      where.actorId = actorId;

    return Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]).then(([data, total]) => ({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }));
  }
}
