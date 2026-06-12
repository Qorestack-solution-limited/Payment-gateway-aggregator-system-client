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

type FlutterwaveResponse<T> = {
  status: string;
  message: string;
  data: T;
  meta?: Record<string, any>;
};

@Injectable()
export class FlutterwaveAdapter implements PaymentGatewayAdapter {
  readonly provider = GatewayProvider.FLUTTERWAVE;
  private readonly baseUrl = 'https://api.flutterwave.com/v3';

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

    const payload = (await response.json()) as FlutterwaveResponse<T>;
    if (!response.ok || payload.status !== 'success') {
      if (response.status === 401) {
        throw new UnauthorizedException(payload?.message || 'Flutterwave credentials rejected');
      }
      throw new BadRequestException(payload?.message || 'Flutterwave request failed');
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
    const data = await this.request<{ link?: string }>(gateway, '/payments', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: input.reference,
        amount: String(input.amount),
        currency: input.currency ?? 'NGN',
        redirect_url: process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173/transactions',
        customer: {
          email: input.customerEmail,
          name: input.customerName,
        },
        customizations: {
          title: gateway.name,
          description: input.description || `${gateway.name} payment`,
        },
        meta: {
          gatewayId: gateway.id,
          ...(input.metadata ?? {}),
        },
      }),
    });

    return {
      reference: input.reference,
      providerReference: input.reference,
      providerStatus: 'pending',
      checkoutUrl: data.link,
      raw: data as unknown as Record<string, unknown>,
    };
  }

  async verifyPayment(gateway: Gateway, reference: string): Promise<VerifiedPayment> {
    const query = new URLSearchParams({ tx_ref: reference }).toString();
    const data = await this.request<any>(gateway, `/transactions/verify_by_reference?${query}`, {
      method: 'GET',
    });

    return {
      reference: data.tx_ref ?? reference,
      providerReference: data.flw_ref ?? data.tx_ref ?? reference,
      providerTransactionId: data.id ? String(data.id) : undefined,
      providerStatus: data.status,
      amount: Number(data.amount ?? data.charged_amount ?? 0),
      currency: data.currency ?? 'NGN',
      customerName:
        data.customer?.name ??
        ([data.customer?.first_name, data.customer?.last_name].filter(Boolean).join(' ') || 'Customer'),
      customerEmail: data.customer?.email ?? '',
      paidAt: data.created_at ?? data.createdAt,
      raw: data,
    };
  }

  async fetchTransactions(gateway: Gateway, options: GatewaySyncOptions = {}): Promise<SyncedGatewayTransaction[]> {
    const query = new URLSearchParams();
    query.set('from', options.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    query.set('to', options.to || new Date().toISOString().slice(0, 10));
    if (options.page) query.set('page', String(options.page));

    const data = await this.request<any[]>(gateway, `/transactions?${query.toString()}`, {
      method: 'GET',
    });

    return data.map((item) => ({
      reference: item.tx_ref ?? item.id?.toString() ?? `flw_${Date.now()}`,
      providerReference: item.flw_ref ?? item.tx_ref,
      providerTransactionId: item.id ? String(item.id) : undefined,
      providerStatus: item.status,
      amount: Number(item.amount ?? item.charged_amount ?? 0),
      currency: item.currency ?? 'NGN',
      customerName:
        item.customer?.name ??
        ([item.customer?.first_name, item.customer?.last_name].filter(Boolean).join(' ') || 'Customer'),
      customerEmail: item.customer?.email ?? '',
      description: item.narration ?? item.processor_response,
      paidAt: item.created_at ?? item.createdAt,
      metadata: item.meta ?? {},
      raw: item,
    }));
  }

  async refundPayment(gateway: Gateway, transactionId: string, amount?: number): Promise<RefundResult> {
    const body: Record<string, unknown> = {};
    if (amount != null) body.amount = amount;

    const data = await this.request<any>(gateway, `/transactions/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      refundId: String(data.id ?? transactionId),
      status: data.status ?? 'pending',
      amount: data.amount_refunded ?? amount,
      currency: data.currency ?? 'NGN',
      raw: data,
    };
  }

  async validateConfiguration(gateway: Gateway) {
    const today = new Date().toISOString().slice(0, 10);
    await this.request<any[]>(gateway, `/transactions?from=${today}&to=${today}&page=1`, { method: 'GET' });
    return { ok: true, message: 'Flutterwave configuration is valid' };
  }
}
