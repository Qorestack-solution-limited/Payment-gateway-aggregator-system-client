import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { GatewayCredentialsService } from './gateway-credentials.service';
import { PaymentGatewayRegistry } from './payment-gateway.registry';
import { GatewayProvider, GatewayStatus } from '@prisma/client';
import * as crypto from 'crypto';

const mockPrisma = {
  gateway: { findMany: jest.fn(), update: jest.fn() },
  transaction: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  providerWebhookEvent: { create: jest.fn() },
};

const mockWebhooks = { dispatchEvent: jest.fn().mockResolvedValue(undefined) };

const mockCredentials = {
  decrypt: jest.fn().mockImplementation((v) => v),
  hydrateGateway: jest.fn().mockImplementation((gw) => gw),
};

const mockAdapter = {
  verifyPayment: jest.fn(),
};

const mockRegistry = { forGateway: jest.fn().mockReturnValue(mockAdapter) };

const activeGateway = {
  id: 'gw1',
  name: 'Test Paystack',
  provider: GatewayProvider.PAYSTACK,
  status: GatewayStatus.ACTIVE,
  organizationId: 'org1',
  secretKey: 'sk_test_secret',
  webhookSecret: 'wh_secret',
};

const baseTx = {
  id: 'tx1',
  reference: 'ref_001',
  status: 'PENDING',
  organizationId: 'org1',
  gatewayId: 'gw1',
  gateway: activeGateway,
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.providerWebhookEvent.create.mockResolvedValue({});
    mockPrisma.gateway.update.mockResolvedValue({});
    mockPrisma.transaction.findFirst.mockResolvedValue(null);
    mockPrisma.transaction.create.mockResolvedValue(baseTx);
    mockPrisma.transaction.update.mockResolvedValue(baseTx);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService,            useValue: mockPrisma },
        { provide: WebhooksService,           useValue: mockWebhooks },
        { provide: GatewayCredentialsService, useValue: mockCredentials },
        { provide: PaymentGatewayRegistry,    useValue: mockRegistry },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  // ── handlePaystackWebhook ─────────────────────────────────────────────────
  describe('handlePaystackWebhook', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_001', status: 'success', amount: 500000, currency: 'NGN', customer: { email: 'jane@test.com' }, metadata: { customerName: 'Jane Doe' } } });

    function buildSignature(secret: string, body: string) {
      return crypto.createHmac('sha512', secret).update(body).digest('hex');
    }

    it('processes a valid Paystack webhook', async () => {
      const sig = buildSignature('sk_test_secret', rawBody);
      mockPrisma.gateway.findMany.mockResolvedValue([activeGateway]);
      const payload = JSON.parse(rawBody);

      const result = await service.handlePaystackWebhook(sig, rawBody, payload);

      expect(result.received).toBe(true);
      expect(result.gatewayId).toBe('gw1');
      expect(mockPrisma.transaction.create).toHaveBeenCalledTimes(1);
      expect(mockWebhooks.dispatchEvent).toHaveBeenCalledWith('org1', 'payment.success', expect.any(Object));
    });

    it('rejects request with missing signature', async () => {
      mockPrisma.gateway.findMany.mockResolvedValue([activeGateway]);

      await expect(
        service.handlePaystackWebhook(undefined, rawBody, JSON.parse(rawBody)),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects request with invalid signature', async () => {
      mockPrisma.gateway.findMany.mockResolvedValue([activeGateway]);

      await expect(
        service.handlePaystackWebhook('invalid_sig', rawBody, JSON.parse(rawBody)),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('logs and returns ignored when no reference in payload', async () => {
      const sig = buildSignature('sk_test_secret', JSON.stringify({ event: 'charge.success', data: { status: 'success' } }));
      mockPrisma.gateway.findMany.mockResolvedValue([activeGateway]);

      const result = await service.handlePaystackWebhook(
        sig,
        JSON.stringify({ event: 'charge.success', data: { status: 'success' } }),
        { event: 'charge.success', data: { status: 'success' } },
      );

      expect(result.ignored).toBe(true);
    });

    it('upserts existing transaction instead of creating new one', async () => {
      const sig = buildSignature('sk_test_secret', rawBody);
      mockPrisma.gateway.findMany.mockResolvedValue([activeGateway]);
      mockPrisma.transaction.findFirst.mockResolvedValue(baseTx);
      const payload = JSON.parse(rawBody);

      await service.handlePaystackWebhook(sig, rawBody, payload);

      expect(mockPrisma.transaction.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
    });
  });

  // ── handleFlutterwaveWebhook ──────────────────────────────────────────────
  describe('handleFlutterwaveWebhook', () => {
    it('rejects with invalid webhook hash', async () => {
      mockPrisma.gateway.findMany.mockResolvedValue([activeGateway]);

      await expect(
        service.handleFlutterwaveWebhook('wrong_hash', '', { type: 'charge', data: {} }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('processes valid Flutterwave webhook', async () => {
      const flwGateway = {
        ...activeGateway,
        provider: GatewayProvider.FLUTTERWAVE,
        webhookSecret: 'fw_secret',
      };
      mockPrisma.gateway.findMany.mockResolvedValue([flwGateway]);
      mockAdapter.verifyPayment.mockResolvedValue({
        reference: 'ref_001',
        providerReference: 'flw_ref_001',
        providerTransactionId: 'tx_001',
        providerStatus: 'successful',
        amount: 5000,
        currency: 'NGN',
        customerName: 'Jane Doe',
        customerEmail: 'jane@test.com',
        raw: {},
      });

      const result = await service.handleFlutterwaveWebhook(
        'fw_secret',
        '{}',
        { type: 'charge.completed', data: { tx_ref: 'ref_001', status: 'successful', meta: {} } },
      );

      expect(result.received).toBe(true);
      expect(mockAdapter.verifyPayment).toHaveBeenCalledTimes(1);
    });
  });

  // ── handleStripeWebhook ───────────────────────────────────────────────────
  describe('handleStripeWebhook', () => {
    it('rejects with invalid Stripe signature', async () => {
      const stripeGateway = {
        ...activeGateway,
        provider: GatewayProvider.STRIPE,
        webhookSecret: 'whsec_test',
      };
      mockPrisma.gateway.findMany.mockResolvedValue([stripeGateway]);

      await expect(
        service.handleStripeWebhook('t=1234,v1=invalid', '{}', { type: 'checkout.session.completed', data: { object: {} } }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
