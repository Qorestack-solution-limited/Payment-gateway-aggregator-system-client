import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { GatewayProvider, GatewayStatus, TransactionStatus } from '@prisma/client';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { GatewayCredentialsService } from './gateway-credentials.service';
import { PaymentGatewayRegistry } from './payment-gateway.registry';

type PaystackWebhookPayload = {
  event?: string;
  data?: Record<string, any>;
};

type FlutterwaveWebhookPayload = {
  type?: string;
  data?: Record<string, any>;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webhooks: WebhooksService,
    private readonly credentials: GatewayCredentialsService,
    private readonly registry: PaymentGatewayRegistry,
  ) {}

  private signPaystackPayload(secretKey: string, rawBody: string) {
    return createHmac('sha512', secretKey).update(rawBody).digest('hex');
  }

  private normalizeStatus(status?: string): TransactionStatus {
    const map: Record<string, TransactionStatus> = {
      success: TransactionStatus.SUCCESS,
      successful: TransactionStatus.SUCCESS,
      failed: TransactionStatus.FAILED,
      abandoned: TransactionStatus.FAILED,
      pending: TransactionStatus.PENDING,
      processing: TransactionStatus.PENDING,
      refunded: TransactionStatus.REFUNDED,
    };

    return map[String(status ?? '').toLowerCase()] ?? TransactionStatus.PENDING;
  }

  private async upsertProviderTransaction(input: {
    gatewayId: string;
    organizationId: string;
    reference: string;
    providerReference?: string;
    providerTransactionId?: string;
    providerStatus?: string;
    amount?: number;
    currency?: string;
    customerName?: string;
    customerEmail?: string;
    description?: string;
    metadata?: Record<string, any>;
    raw?: Record<string, any>;
    normalizedStatus: TransactionStatus;
  }) {
    const existing = await this.prisma.transaction.findFirst({
      where: {
        organizationId: input.organizationId,
        OR: [
          { reference: input.reference },
          input.providerTransactionId ? { providerTransactionId: input.providerTransactionId } : undefined,
        ].filter(Boolean) as any,
      },
      include: { gateway: true },
    });

    if (existing) {
      return this.prisma.transaction.update({
        where: { id: existing.id },
        data: {
          status: input.normalizedStatus,
          reference: input.reference,
          providerReference: input.providerReference ?? input.reference,
          providerTransactionId: input.providerTransactionId ?? existing.providerTransactionId,
          providerStatus: input.providerStatus,
          providerPayload: input.raw as any,
          syncedFromProvider: true,
          lastSyncedAt: new Date(),
          amount: input.amount || existing.amount,
          currency: input.currency ?? existing.currency,
          customerName: input.customerName || existing.customerName,
          customerEmail: input.customerEmail || existing.customerEmail,
          description: input.description ?? existing.description,
          metadata: (input.metadata ?? existing.metadata) as any,
        },
        include: { gateway: true },
      });
    }

    return this.prisma.transaction.create({
      data: {
        organizationId: input.organizationId,
        gatewayId: input.gatewayId,
        reference: input.reference,
        providerReference: input.providerReference ?? input.reference,
        providerTransactionId: input.providerTransactionId,
        providerStatus: input.providerStatus,
        providerPayload: input.raw as any,
        syncedFromProvider: true,
        lastSyncedAt: new Date(),
        amount: input.amount || 0,
        currency: input.currency ?? 'NGN',
        customerName: input.customerName || 'Customer',
        customerEmail: input.customerEmail || '',
        description: input.description,
        metadata: (input.metadata ?? {}) as any,
        status: input.normalizedStatus,
      },
      include: { gateway: true },
    });
  }

  private async logWebhookEvent(input: {
    provider: GatewayProvider;
    event: string;
    status: string;
    signature?: string;
    reference?: string;
    payload?: Record<string, any>;
    rawBody?: string;
    errorMessage?: string;
    gatewayId?: string;
    organizationId?: string;
    transactionId?: string;
  }) {
    return this.prisma.providerWebhookEvent.create({
      data: {
        provider: input.provider,
        event: input.event,
        status: input.status,
        signature: input.signature,
        reference: input.reference,
        payload: input.payload as any,
        rawBody: input.rawBody,
        errorMessage: input.errorMessage,
        gatewayId: input.gatewayId,
        organizationId: input.organizationId,
        transactionId: input.transactionId,
      },
    });
  }

  private async resolvePaystackGateway(signature: string | undefined, rawBody: string) {
    if (!signature) {
      throw new UnauthorizedException('Missing Paystack signature');
    }

    const gateways = await this.prisma.gateway.findMany({
      where: {
        provider: GatewayProvider.PAYSTACK,
        status: GatewayStatus.ACTIVE,
        secretKey: { not: null },
      },
    });

    const gateway = gateways.find((item) => {
      const secretKey = this.credentials.decrypt(item.secretKey);
      if (!secretKey) return false;
      return this.signPaystackPayload(secretKey, rawBody) === signature;
    });

    if (!gateway) {
      throw new UnauthorizedException('Invalid Paystack webhook signature');
    }

    return gateway;
  }

  async handlePaystackWebhook(signature: string | undefined, rawBody: string, payload: PaystackWebhookPayload) {
    let gateway;
    try {
      gateway = await this.resolvePaystackGateway(signature, rawBody);
    } catch (error) {
      await this.logWebhookEvent({
        provider: GatewayProvider.PAYSTACK,
        event: payload?.event ?? 'unknown',
        status: 'REJECTED',
        signature,
        reference: payload?.data?.reference ? String(payload.data.reference) : undefined,
        rawBody,
        payload: payload?.data,
        errorMessage: error instanceof Error ? error.message : 'Invalid Paystack webhook signature',
      });
      throw error;
    }

    if (!payload?.event || !payload?.data) {
      await this.logWebhookEvent({
        provider: GatewayProvider.PAYSTACK,
        event: 'unknown',
        status: 'REJECTED',
        signature,
        rawBody,
        payload: payload?.data,
        gatewayId: gateway.id,
        organizationId: gateway.organizationId,
        errorMessage: 'Invalid Paystack webhook payload',
      });
      throw new BadRequestException('Invalid Paystack webhook payload');
    }

    const reference = payload.data.reference ? String(payload.data.reference) : '';
    if (!reference) {
      await this.logWebhookEvent({
        provider: GatewayProvider.PAYSTACK,
        event: payload.event,
        status: 'IGNORED',
        signature,
        rawBody,
        payload: payload.data,
        gatewayId: gateway.id,
        organizationId: gateway.organizationId,
        errorMessage: 'Webhook does not include a transaction reference',
      });
      return {
        received: true,
        gatewayId: gateway.id,
        provider: gateway.provider,
        ignored: true,
        reason: 'Webhook does not include a transaction reference',
      };
    }

    const organizationId = gateway.organizationId;
    const normalizedStatus = this.normalizeStatus(payload.data.status ?? payload.event);
    const paidAt = payload.data.paid_at ?? payload.data.paidAt ?? payload.data.created_at ?? payload.data.createdAt;
    const customerName =
      payload.data.metadata?.customerName ??
      payload.data.customer?.name ??
      ([payload.data.customer?.first_name, payload.data.customer?.last_name].filter(Boolean).join(' ') || 'Customer');

    const customerEmail = payload.data.customer?.email ?? payload.data.metadata?.customerEmail ?? '';
    const amount = Number(payload.data.amount ?? 0) / 100;
    const transaction = await this.upsertProviderTransaction({
      gatewayId: gateway.id,
      organizationId,
      reference,
      providerReference: reference,
      providerTransactionId: payload.data.id ? String(payload.data.id) : undefined,
      providerStatus: payload.data.status ?? payload.event,
      amount,
      currency: payload.data.currency ?? 'NGN',
      customerName,
      customerEmail,
      description: payload.data.metadata?.description ?? payload.data.message,
      metadata: payload.data.metadata ?? {},
      raw: payload.data,
      normalizedStatus,
    });

    await this.webhooks.dispatchEvent(organizationId, `payment.${normalizedStatus.toLowerCase()}`, {
      source: 'paystack-webhook',
      event: payload.event,
      transaction,
      paidAt,
    });

    await this.prisma.gateway.update({
      where: { id: gateway.id },
      data: {
        lastSyncedAt: new Date(),
        lastSyncStatus: 'SUCCESS',
        lastSyncMessage: `Webhook processed: ${payload.event} (${reference})`,
      },
    });

    await this.logWebhookEvent({
      provider: GatewayProvider.PAYSTACK,
      event: payload.event,
      status: 'PROCESSED',
      signature,
      reference,
      rawBody,
      payload: payload.data,
      gatewayId: gateway.id,
      organizationId,
      transactionId: transaction.id,
    });

    return {
      received: true,
      gatewayId: gateway.id,
      transactionId: transaction.id,
      event: payload.event,
      status: transaction.status,
    };
  }

  async handleStripeWebhook(signatureHeader: string | undefined, rawBody: string, payload: Record<string, any>) {
    const { createHmac: hmac, timingSafeEqual } = await import('crypto');

    const gateways = await this.prisma.gateway.findMany({
      where: { provider: GatewayProvider.STRIPE, status: GatewayStatus.ACTIVE, webhookSecret: { not: null } },
    });

    let matchedGateway: (typeof gateways)[0] | undefined;
    if (signatureHeader) {
      for (const gw of gateways) {
        const secret = this.credentials.decrypt(gw.webhookSecret);
        if (!secret) continue;
        const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, p) => {
          const [k, v] = p.split('=');
          if (k && v) acc[k] = v;
          return acc;
        }, {});
        const t = parts['t'];
        const v1 = parts['v1'];
        if (!t || !v1) continue;
        const expected = hmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
        try {
          if (timingSafeEqual(Buffer.from(expected), Buffer.from(v1))) {
            matchedGateway = gw;
            break;
          }
        } catch { /* length mismatch = no match */ }
      }
    }

    if (!matchedGateway) {
      await this.logWebhookEvent({
        provider: GatewayProvider.STRIPE,
        event: payload?.type ?? 'unknown',
        status: 'REJECTED',
        signature: signatureHeader,
        rawBody,
        errorMessage: 'Invalid Stripe webhook signature',
      });
      throw new UnauthorizedException('Invalid Stripe webhook signature');
    }

    if (!payload?.type || !payload?.data?.object) {
      return { received: true, ignored: true, reason: 'Unsupported event shape' };
    }

    const obj = payload.data.object;
    const reference = obj.metadata?.reference ?? obj.client_reference_id ?? obj.id;
    const normalizedStatus = this.normalizeStatus(obj.payment_status ?? obj.status ?? payload.type);

    const transaction = await this.upsertProviderTransaction({
      gatewayId: matchedGateway.id,
      organizationId: matchedGateway.organizationId,
      reference: String(reference),
      providerReference: obj.id,
      providerTransactionId: typeof obj.payment_intent === 'string' ? obj.payment_intent : obj.payment_intent?.id,
      providerStatus: obj.payment_status ?? obj.status ?? payload.type,
      amount: obj.amount_total != null ? Number(obj.amount_total) / 100 : undefined,
      currency: String(obj.currency ?? 'usd').toUpperCase(),
      customerName: obj.metadata?.customerName ?? obj.customer_details?.name ?? 'Customer',
      customerEmail: obj.customer_details?.email ?? obj.customer_email ?? '',
      raw: obj,
      normalizedStatus,
    });

    await this.webhooks.dispatchEvent(matchedGateway.organizationId, `payment.${normalizedStatus.toLowerCase()}`, {
      source: 'stripe-webhook', event: payload.type, transaction,
    });

    await this.logWebhookEvent({
      provider: GatewayProvider.STRIPE, event: payload.type, status: 'PROCESSED',
      signature: signatureHeader, reference: String(reference), rawBody, payload: obj,
      gatewayId: matchedGateway.id, organizationId: matchedGateway.organizationId, transactionId: transaction.id,
    });

    return { received: true, gatewayId: matchedGateway.id, transactionId: transaction.id, event: payload.type };
  }

  async handlePayPalWebhook(webhookSecret: string | undefined, rawBody: string, payload: Record<string, any>) {
    const gateways = await this.prisma.gateway.findMany({
      where: { provider: GatewayProvider.PAYPAL, status: GatewayStatus.ACTIVE, webhookSecret: { not: null } },
    });

    const matchedGateway = gateways.find((gw) => this.credentials.decrypt(gw.webhookSecret) === webhookSecret);

    if (!matchedGateway) {
      await this.logWebhookEvent({
        provider: GatewayProvider.PAYPAL, event: payload?.event_type ?? 'unknown', status: 'REJECTED',
        rawBody, errorMessage: 'Invalid PayPal webhook secret',
      });
      throw new UnauthorizedException('Invalid PayPal webhook secret');
    }

    const eventType = payload?.event_type ?? 'UNKNOWN';
    const resource = payload?.resource ?? {};
    const reference = resource.custom_id ?? resource.invoice_id ?? resource.id ?? '';
    const statusMap: Record<string, string> = {
      'PAYMENT.CAPTURE.COMPLETED': 'success',
      'PAYMENT.CAPTURE.DENIED': 'failed',
      'PAYMENT.CAPTURE.PENDING': 'pending',
      'PAYMENT.CAPTURE.REFUNDED': 'refunded',
      'CHECKOUT.ORDER.APPROVED': 'pending',
      'CHECKOUT.ORDER.COMPLETED': 'success',
    };
    const normalizedStatus = this.normalizeStatus(statusMap[eventType] ?? resource.status ?? eventType);

    const transaction = await this.upsertProviderTransaction({
      gatewayId: matchedGateway.id,
      organizationId: matchedGateway.organizationId,
      reference: String(reference || resource.id),
      providerReference: resource.id,
      providerTransactionId: resource.id,
      providerStatus: resource.status ?? eventType,
      amount: resource.amount?.value ? Number(resource.amount.value) : undefined,
      currency: resource.amount?.currency_code ?? 'USD',
      customerName: resource.payer?.name?.given_name
        ? `${resource.payer.name.given_name} ${resource.payer.name.surname}`.trim()
        : 'Customer',
      customerEmail: resource.payer?.email_address ?? '',
      raw: resource,
      normalizedStatus,
    });

    await this.webhooks.dispatchEvent(matchedGateway.organizationId, `payment.${normalizedStatus.toLowerCase()}`, {
      source: 'paypal-webhook', event: eventType, transaction,
    });

    await this.logWebhookEvent({
      provider: GatewayProvider.PAYPAL, event: eventType, status: 'PROCESSED',
      signature: webhookSecret, reference: String(reference), rawBody, payload: resource,
      gatewayId: matchedGateway.id, organizationId: matchedGateway.organizationId, transactionId: transaction.id,
    });

    return { received: true, gatewayId: matchedGateway.id, transactionId: transaction.id, event: eventType };
  }

  async handleFlutterwaveWebhook(signature: string | undefined, rawBody: string, payload: FlutterwaveWebhookPayload) {
    const gateways = await this.prisma.gateway.findMany({
      where: {
        provider: GatewayProvider.FLUTTERWAVE,
        status: GatewayStatus.ACTIVE,
        webhookSecret: { not: null },
      },
    });

    const matchedGateway = gateways.find((item) => this.credentials.decrypt(item.webhookSecret) === signature);

    if (!matchedGateway) {
      await this.logWebhookEvent({
        provider: GatewayProvider.FLUTTERWAVE,
        event: payload?.type ?? 'unknown',
        status: 'REJECTED',
        signature,
        reference: payload?.data?.tx_ref ? String(payload.data.tx_ref) : undefined,
        rawBody,
        payload: payload?.data,
        errorMessage: 'Invalid Flutterwave webhook secret hash',
      });
      throw new UnauthorizedException('Invalid Flutterwave webhook signature');
    }

    if (!payload?.type || !payload?.data) {
      await this.logWebhookEvent({
        provider: GatewayProvider.FLUTTERWAVE,
        event: payload?.type ?? 'unknown',
        status: 'REJECTED',
        signature,
        rawBody,
        payload: payload?.data,
        gatewayId: matchedGateway.id,
        organizationId: matchedGateway.organizationId,
        errorMessage: 'Invalid Flutterwave webhook payload',
      });
      throw new BadRequestException('Invalid Flutterwave webhook payload');
    }

    const hydratedGateway = this.credentials.hydrateGateway(matchedGateway);
    const adapter = this.registry.forGateway(hydratedGateway);
    const reference = payload.data.tx_ref ? String(payload.data.tx_ref) : '';

    if (!reference) {
      await this.logWebhookEvent({
        provider: GatewayProvider.FLUTTERWAVE,
        event: payload.type,
        status: 'IGNORED',
        signature,
        rawBody,
        payload: payload.data,
        gatewayId: matchedGateway.id,
        organizationId: matchedGateway.organizationId,
        errorMessage: 'Webhook does not include tx_ref',
      });
      return {
        received: true,
        gatewayId: matchedGateway.id,
        provider: matchedGateway.provider,
        ignored: true,
        reason: 'Webhook does not include tx_ref',
      };
    }

    const verified = await adapter.verifyPayment(hydratedGateway, reference);
    const normalizedStatus = this.normalizeStatus(verified.providerStatus ?? payload.data.status ?? payload.type);
    const transaction = await this.upsertProviderTransaction({
      gatewayId: matchedGateway.id,
      organizationId: matchedGateway.organizationId,
      reference: verified.reference || reference,
      providerReference: verified.providerReference,
      providerTransactionId: verified.providerTransactionId,
      providerStatus: verified.providerStatus ?? payload.type,
      amount: verified.amount,
      currency: verified.currency,
      customerName: verified.customerName,
      customerEmail: verified.customerEmail,
      description: payload.data.narration ?? payload.data.processor_response,
      metadata: payload.data.meta ?? {},
      raw: verified.raw,
      normalizedStatus,
    });

    await this.prisma.gateway.update({
      where: { id: matchedGateway.id },
      data: {
        lastSyncedAt: new Date(),
        lastSyncStatus: 'SUCCESS',
        lastSyncMessage: `Webhook processed: ${payload.type} (${reference})`,
      },
    });

    await this.webhooks.dispatchEvent(matchedGateway.organizationId, `payment.${normalizedStatus.toLowerCase()}`, {
      source: 'flutterwave-webhook',
      event: payload.type,
      transaction,
    });

    await this.logWebhookEvent({
      provider: GatewayProvider.FLUTTERWAVE,
      event: payload.type,
      status: 'PROCESSED',
      signature,
      reference,
      rawBody,
      payload: payload.data,
      gatewayId: matchedGateway.id,
      organizationId: matchedGateway.organizationId,
      transactionId: transaction.id,
    });

    return {
      received: true,
      gatewayId: matchedGateway.id,
      transactionId: transaction.id,
      event: payload.type,
      status: transaction.status,
    };
  }
}
