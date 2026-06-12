import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  transaction: {
    groupBy: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockGroupByResult = [
  {
    customerEmail: 'jane@test.com',
    customerName: 'Jane Doe',
    _count: { _all: 5 },
    _sum: { amount: 25000 },
    _max: { createdAt: new Date('2024-01-15') },
  },
  {
    customerEmail: 'john@test.com',
    customerName: 'John Smith',
    _count: { _all: 2 },
    _sum: { amount: 8000 },
    _max: { createdAt: new Date('2024-01-10') },
  },
];

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll', () => {
    beforeEach(() => {
      mockPrisma.transaction.groupBy.mockResolvedValue(mockGroupByResult);
      mockPrisma.transaction.count
        .mockResolvedValueOnce(4) // jane success
        .mockResolvedValueOnce(1) // jane failed
        .mockResolvedValueOnce(0) // jane pending
        .mockResolvedValueOnce(2) // john success
        .mockResolvedValueOnce(0) // john failed
        .mockResolvedValueOnce(0); // john pending
    });

    it('returns aggregated customer list', async () => {
      const result = await service.findAll('org1');

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('jane@test.com');
      expect(result[0].totalTransactions).toBe(5);
      expect(result[0].success).toBe(4);
      expect(result[0].failed).toBe(1);
    });

    it('passes search term as filter', async () => {
      await service.findAll('org1', 'jane');

      expect(mockPrisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('returns empty array when no transactions exist', async () => {
      mockPrisma.transaction.groupBy.mockResolvedValue([]);
      const result = await service.findAll('org1');
      expect(result).toHaveLength(0);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne', () => {
    const txList = [
      {
        id: 'tx1',
        reference: 'ref_001',
        amount: 5000,
        currency: 'NGN',
        status: 'SUCCESS',
        customerName: 'Jane Doe',
        customerEmail: 'jane@test.com',
        createdAt: new Date('2024-01-15'),
        gateway: { name: 'My Paystack', provider: 'PAYSTACK' },
      },
      {
        id: 'tx2',
        reference: 'ref_002',
        amount: 2000,
        currency: 'NGN',
        status: 'FAILED',
        customerName: 'Jane Doe',
        customerEmail: 'jane@test.com',
        createdAt: new Date('2024-01-10'),
        gateway: { name: 'My Paystack', provider: 'PAYSTACK' },
      },
    ];

    it('returns customer profile with transaction history', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue(txList);

      const result = await service.findOne('org1', 'jane@test.com');

      expect(result).not.toBeNull();
      expect(result.email).toBe('jane@test.com');
      expect(result.name).toBe('Jane Doe');
      expect(result.totalTransactions).toBe(2);
      expect(result.totalSpend).toBe(5000); // only SUCCESS transactions
      expect(result.transactions).toHaveLength(2);
    });

    it('returns null when no transactions exist for email', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      const result = await service.findOne('org1', 'nobody@test.com');
      expect(result).toBeNull();
    });
  });
});
