import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

const mockPrisma = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const baseLogInput = {
  action: AuditAction.GATEWAY_TOGGLED,
  actorId: 'user1',
  actorEmail: 'admin@test.com',
  organizationId: 'org1',
  resourceType: 'gateway',
  resourceId: 'gw1',
  description: 'Gateway toggled to INACTIVE',
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  describe('log', () => {
    it('creates an audit log entry', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log1', ...baseLogInput });

      await service.log(baseLogInput);

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: AuditAction.GATEWAY_TOGGLED,
          actorId: 'user1',
          organizationId: 'org1',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('returns paginated audit logs for an org', async () => {
      const logs = [{ id: 'log1', ...baseLogInput, createdAt: new Date() }];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findAll('org1', { page: 1, limit: 30 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('applies resourceType filter', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.findAll('org1', { resourceType: 'gateway' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ resourceType: 'gateway' }),
        }),
      );
    });

    it('applies actorId filter', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.findAll('org1', { actorId: 'user1' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ actorId: 'user1' }),
        }),
      );
    });

    it('uses default pagination when not provided', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.findAll('org1');

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 30,
        }),
      );
    });
  });
});
