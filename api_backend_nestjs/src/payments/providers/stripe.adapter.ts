import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Gateway, GatewayProvider } from '@prisma/client';
import {
  GatewaySyncOptions,
  InitializedPayment,
  PaymentGatewayAdapter,
  RefundResult,
  SyncedGatewayTransaction,
  VerifiedPayment,
} from '../payment-gateway.types';

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

@Injectable()
export class StripeAdapter implements PaymentGatewayAdapter {
  readonly provider = GatewayProvider.STRIPE;
  private readonly baseUrl = 'https://api.stripe.com/v1';

  private getSecretKey(gateway: Gateway) {
    if (!gateway.secretKey) {
      throw new BadRequestException(`Gateway ${gateway.name} is missing a secret key`);
    }
    return gateway.secretKey;
  }

  private toSmallestUnit(amount: number, currency = 'usd') {
    return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase())
      ? Math.round(Number(amount))
      : Math.round(Number(amount) * 100);
  }

  private flattenForm(input: Record<string, any>, prefix?: string, params = new URLSearchParams()) {
    Object.entries(input).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const path = prefix ? `${prefix}[${key}]` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item !== undefined && item !== null) {
            if (typeof item === 'object') {
              this.flattenForm(item, `${path}[${index}]`, params);
            } else {
              params.append(`${path}[${index}]`, String(item));
            }
          }
        });
        return;
      }

      if (typeof value === 'object') {
        this.flattenForm(value, path, params);
        return;
      }

      params.append(path, String(value));
    });

    return params;
  }

  private async request<T>(gateway: Gateway, path: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.getSecretKey(gateway)}`,
        ...(options.headers ?? {}),
      },
    });

    const payload = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedException(payload?.error?.message || 'Stripe credentials rejected');
      }
      throw new BadRequestException(payload?.error?.message || 'Stripe request failed');
    }

    return payload as T;
  }

  async initializePayment(
    gateway: Gateway,
    input: {
      amount: number;
      currency?: string;
      customerName: string;
      customerEmail: string;
      description?: string;
      reference: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<InitializedPayment> {
    const currency = (input.currency ?? 'USD').toLowerCase();
    const form = this.flattenForm({
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/transactions?status=success&gateway=stripe&reference=${input.reference}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/transactions?status=cancelled&gateway=stripe&reference=${input.reference}`,
      client_reference_id: input.reference,
      customer_email: input.customerEmail,
      payment_intent_data: {
        description: input.description || `${gateway.name} payment`,
        metadata: {
          reference: input.reference,
          customerName: input.customerName,
          gatewayId: gateway.id,
          ...(input.metadata ?? {}),
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: this.toSmallestUnit(input.amount, currency),
            product_data: {
              name: input.description || `${gateway.name} payment`,
              description: input.customerName,
            },
          },
        },
      ],
    });

    const data = await this.request<any>(gateway, '/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    return {
      reference: input.reference,
      providerReference: data.id,
      providerTransactionId: data.payment_intent ?? undefined,
      providerStatus: data.payment_status ?? data.status,
      checkoutUrl: data.url,
      raw: data,
    };
  }

  async verifyPayment(gateway: Gateway, reference: string): Promise<VerifiedPayment> {
    const data = await this.request<any>(gateway, `/checkout/sessions/${reference}?expand[]=payment_intent`, {
      method: 'GET',
    });

    const paymentIntent = typeof data.payment_intent === 'object' ? data.payment_intent : null;
    const metadata = paymentIntent?.metadata ?? {};

    return {
      reference: data.client_reference_id ?? metadata.reference ?? reference,
      providerReference: data.id,
      providerTransactionId: paymentIntent?.id ?? (typeof data.payment_intent === 'string' ? data.payment_intent : undefined),
      providerStatus: paymentIntent?.status ?? data.payment_status ?? data.status,
      amount: data.amount_total != null ? Number(data.amount_total) / (ZERO_DECIMAL_CURRENCIES.has(String(data.currency || '').toLowerCase()) ? 1 : 100) : undefined,
      currency: data.currency?.toUpperCase() ?? undefined,
      customerName: metadata.customerName ?? data.customer_details?.name ?? 'Customer',
      customerEmail: data.customer_details?.email ?? data.customer_email ?? '',
      paidAt: paymentIntent?.created ? new Date(paymentIntent.created * 1000).toISOString() : undefined,
      raw: data,
    };
  }

  async fetchTransactions(gateway: Gateway, options: GatewaySyncOptions = {}): Promise<SyncedGatewayTransaction[]> {
    const fromUnix = options.from ? Math.floor(new Date(options.from).getTime() / 1000) : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const toUnix = options.to ? Math.floor(new Date(options.to).getTime() / 1000) : Math.floor(Date.now() / 1000);

    const query = new URLSearchParams();
    query.set('limit', String(options.perPage ?? 100));
    query.set('created[gte]', String(fromUnix));
    query.set('created[lte]', String(toUnix));

    const data = await this.request<{ data: any[] }>(gateway, `/payment_intents?${query.toString()}`, {
      method: 'GET',
    });

    return (data.data ?? []).map((item) => {
      const currency = String(item.currency ?? 'usd').toLowerCase();
      const amount = item.amount_received ?? item.amount ?? 0;
      return {
        reference: item.metadata?.reference ?? item.id,
        providerReference: item.latest_charge ?? item.id,
        providerTransactionId: item.id,
        providerStatus: item.status,
        amount: Number(amount) / (ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100),
        currency: currency.toUpperCase(),
        customerName: item.metadata?.customerName ?? 'Customer',
        customerEmail: item.receipt_email ?? '',
        description: item.description,
        paidAt: item.created ? new Date(item.created * 1000).toISOString() : undefined,
        metadata: item.metadata ?? {},
        raw: item,
      };
    });
  }

  async refundPayment(gateway: Gateway, transactionId: string, amount?: number): Promise<RefundResult> {
    const currency = 'usd';
    const form = this.flattenForm({
      payment_intent: transactionId,
      ...(amount != null ? { amount: this.toSmallestUnit(amount, currency) } : {}),
    });

    const data = await this.request<any>(gateway, '/refunds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    return {
      refundId: data.id,
      status: data.status ?? 'pending',
      amount: data.amount != null
        ? Number(data.amount) / (ZERO_DECIMAL_CURRENCIES.has(String(data.currency || '').toLowerCase()) ? 1 : 100)
        : amount,
      currency: String(data.currency ?? 'usd').toUpperCase(),
      raw: data,
    };
  }

  async validateConfiguration(gateway: Gateway) {
    await this.request<any>(gateway, '/payment_intents?limit=1', { method: 'GET' });
    return { ok: true, message: 'Stripe configuration is valid' };
  }
}
