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

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

@Injectable()
export class PaystackAdapter implements PaymentGatewayAdapter {
  readonly provider = GatewayProvider.PAYSTACK;
  private readonly baseUrl = 'https://api.paystack.co';

  private getSecretKey(gateway: Gateway) {
    if (!gateway.secretKey) {
      throw new BadRequestException(`Gateway ${gateway.name} is missing a secret key`);
    }
    return gateway.secretKey;
  }

  private async request<T>(gateway: Gateway, path: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.getSecretKey(gateway)}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });

    const payload = (await response.json()) as PaystackResponse<T>;
    if (!response.ok || !payload.status) {
      if (response.status === 401) {
        throw new UnauthorizedException(payload?.message || 'Paystack credentials rejected');
      }
      throw new BadRequestException(payload?.message || 'Paystack request failed');
    }

    return payload.data;
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
    const amount = Math.round(Number(input.amount) * 100);
    const data = await this.request<{
      authorization_url?: string;
      access_code?: string;
      reference: string;
    }>(gateway, '/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        amount: String(amount),
        email: input.customerEmail,
        currency: input.currency ?? 'NGN',
        reference: input.reference,
        metadata: {
          customerName: input.customerName,
          description: input.description,
          gatewayId: gateway.id,
          ...(input.metadata ?? {}),
        },
      }),
    });

    return {
      reference: data.reference,
      providerReference: data.reference,
      providerStatus: 'pending',
      checkoutUrl: data.authorization_url,
      accessCode: data.access_code,
      raw: data as unknown as Record<string, unknown>,
    };
  }

  async verifyPayment(gateway: Gateway, reference: string): Promise<VerifiedPayment> {
    const data = await this.request<any>(gateway, `/transaction/verify/${reference}`, {
      method: 'GET',
    });

    return {
      reference: data.reference,
      providerReference: data.reference,
      providerTransactionId: data.id ? String(data.id) : undefined,
      providerStatus: data.status,
      amount: Number(data.amount ?? 0) / 100,
      currency: data.currency ?? 'NGN',
      customerName: data.metadata?.customerName ?? data.customer?.first_name ?? data.customer?.name ?? 'Customer',
      customerEmail: data.customer?.email ?? '',
      paidAt: data.paid_at ?? data.paidAt ?? data.createdAt,
      raw: data,
    };
  }

  async fetchTransactions(gateway: Gateway, options: GatewaySyncOptions = {}): Promise<SyncedGatewayTransaction[]> {
    const query = new URLSearchParams();
    if (options.page) query.set('page', String(options.page));
    if (options.perPage) query.set('perPage', String(options.perPage));
    if (options.from) query.set('from', options.from);
    if (options.to) query.set('to', options.to);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const data = await this.request<any[]>(gateway, `/transaction${suffix}`, { method: 'GET' });

    return data.map((item) => ({
      reference: item.reference,
      providerReference: item.reference,
      providerTransactionId: item.id ? String(item.id) : undefined,
      providerStatus: item.status,
      amount: Number(item.amount ?? 0) / 100,
      currency: item.currency ?? 'NGN',
      customerName:
        item.metadata?.customerName ??
        item.customer?.name ??
        ([item.customer?.first_name, item.customer?.last_name].filter(Boolean).join(' ') || 'Customer'),
      customerEmail: item.customer?.email ?? '',
      description: item.metadata?.description ?? item.message,
      paidAt: item.paid_at ?? item.paidAt ?? item.createdAt,
      metadata: item.metadata ?? {},
      raw: item,
    }));
  }

  async refundPayment(gateway: Gateway, transactionId: string, amount?: number): Promise<RefundResult> {
    const body: Record<string, unknown> = { transaction: transactionId };
    if (amount != null) body.amount = Math.round(Number(amount) * 100);

    const data = await this.request<any>(gateway, '/refund', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      refundId: String(data.id ?? data.transaction ?? transactionId),
      status: data.status ?? 'pending',
      amount: data.amount != null ? Number(data.amount) / 100 : amount,
      currency: data.currency ?? 'NGN',
      raw: data,
    };
  }

  async validateConfiguration(gateway: Gateway) {
    await this.request<any[]>(gateway, '/transaction?perPage=1', { method: 'GET' });
    return { ok: true, message: 'Paystack configuration is valid' };
  }
}
