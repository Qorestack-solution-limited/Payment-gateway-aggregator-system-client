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

type PayPalToken = {
  access_token: string;
  expires_in: number;
};

@Injectable()
export class PayPalAdapter implements PaymentGatewayAdapter {
  readonly provider = GatewayProvider.PAYPAL;
  private readonly tokenCache = new Map<string, { token: string; expiresAt: number }>();

  private getClientId(gateway: Gateway) {
    if (!gateway.publicKey) {
      throw new BadRequestException(`Gateway ${gateway.name} is missing a PayPal client ID`);
    }
    return gateway.publicKey;
  }

  private getClientSecret(gateway: Gateway) {
    if (!gateway.secretKey) {
      throw new BadRequestException(`Gateway ${gateway.name} is missing a PayPal client secret`);
    }
    return gateway.secretKey;
  }

  private getBaseUrl() {
    const configured = process.env.PAYPAL_API_BASE_URL;
    if (configured) return configured.replace(/\/$/, '');
    return 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(gateway: Gateway) {
    const cached = this.tokenCache.get(gateway.id);
    if (cached && cached.expiresAt > Date.now() + 15_000) {
      return cached.token;
    }

    const auth = Buffer.from(`${this.getClientId(gateway)}:${this.getClientSecret(gateway)}`).toString('base64');
    const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'Accept-Language': 'en_US',
      },
      body: 'grant_type=client_credentials',
    });

    const payload = (await response.json()) as PayPalToken & { error_description?: string };
    if (!response.ok || !payload.access_token) {
      if (response.status === 401) {
        throw new UnauthorizedException(payload?.error_description || 'PayPal credentials rejected');
      }
      throw new BadRequestException(payload?.error_description || 'Failed to get PayPal access token');
    }

    this.tokenCache.set(gateway.id, {
      token: payload.access_token,
      expiresAt: Date.now() + payload.expires_in * 1000,
    });

    return payload.access_token;
  }

  private async request<T>(gateway: Gateway, path: string, options: RequestInit = {}) {
    const token = await this.getAccessToken(gateway);
    const response = await fetch(`${this.getBaseUrl()}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });

    const payload = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedException(payload?.message || 'PayPal credentials rejected');
      }
      throw new BadRequestException(payload?.message || 'PayPal request failed');
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
    const currency = (input.currency ?? 'USD').toUpperCase();
    const data = await this.request<any>(gateway, '/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.reference,
            description: input.description || `${gateway.name} payment`,
            custom_id: input.reference,
            amount: {
              currency_code: currency,
              value: Number(input.amount).toFixed(2),
            },
          },
        ],
        payer: {
          email_address: input.customerEmail,
          name: {
            given_name: input.customerName.split(' ')[0] || input.customerName,
            surname: input.customerName.split(' ').slice(1).join(' ') || 'Customer',
          },
        },
        application_context: {
          return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/transactions?status=success&gateway=paypal&reference=${input.reference}`,
          cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/transactions?status=cancelled&gateway=paypal&reference=${input.reference}`,
        },
      }),
    });

    const approveLink = Array.isArray(data.links)
      ? data.links.find((link: any) => link.rel === 'approve')?.href
      : undefined;

    return {
      reference: input.reference,
      providerReference: data.id,
      providerStatus: data.status,
      checkoutUrl: approveLink,
      raw: data,
    };
  }

  async verifyPayment(gateway: Gateway, reference: string): Promise<VerifiedPayment> {
    const data = await this.request<any>(gateway, `/v2/checkout/orders/${reference}`, {
      method: 'GET',
    });

    const purchaseUnit = data.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const payer = data.payer ?? {};

    return {
      reference: purchaseUnit?.reference_id ?? purchaseUnit?.custom_id ?? reference,
      providerReference: data.id,
      providerTransactionId: capture?.id,
      providerStatus: capture?.status ?? data.status,
      amount: capture?.amount?.value ? Number(capture.amount.value) : purchaseUnit?.amount?.value ? Number(purchaseUnit.amount.value) : undefined,
      currency: capture?.amount?.currency_code ?? purchaseUnit?.amount?.currency_code,
      customerName: [payer.name?.given_name, payer.name?.surname].filter(Boolean).join(' ') || 'Customer',
      customerEmail: payer.email_address ?? '',
      paidAt: capture?.create_time ?? data.create_time,
      raw: data,
    };
  }

  async fetchTransactions(gateway: Gateway, options: GatewaySyncOptions = {}): Promise<SyncedGatewayTransaction[]> {
    const startDate = options.from
      ? `${options.from}T00:00:00Z`
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = options.to
      ? `${options.to}T23:59:59Z`
      : new Date().toISOString();

    const query = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      fields: 'all',
      page_size: String(options.perPage ?? 100),
      page: String(options.page ?? 1),
    });

    const data = await this.request<{ transaction_details?: any[] }>(gateway, `/v1/reporting/transactions?${query.toString()}`, {
      method: 'GET',
    });

    return (data.transaction_details ?? []).map((item) => {
      const info = item.transaction_info ?? {};
      const payer = item.payer_info ?? {};
      const payerName = payer.payer_name?.alternate_full_name
        || [payer.payer_name?.given_name, payer.payer_name?.surname].filter(Boolean).join(' ')
        || 'Customer';
      const statusMap: Record<string, string> = {
        S: 'success',
        V: 'success',
        P: 'pending',
        D: 'failed',
        F: 'failed',
      };

      return {
        reference: info.custom_field ?? info.invoice_id ?? info.transaction_id,
        providerReference: info.transaction_id,
        providerTransactionId: info.transaction_id,
        providerStatus: statusMap[info.transaction_status] ?? info.transaction_status,
        amount: Number(info.transaction_amount?.value ?? 0),
        currency: info.transaction_amount?.currency_code ?? 'USD',
        customerName: payerName,
        customerEmail: payer.email_address ?? '',
        description: info.transaction_subject ?? info.transaction_note,
        paidAt: info.transaction_updated_date ?? info.transaction_initiation_date,
        metadata: {
          invoiceId: info.invoice_id,
          eventCode: info.transaction_event_code,
        },
        raw: item,
      };
    });
  }

  async refundPayment(gateway: Gateway, transactionId: string, amount?: number): Promise<RefundResult> {
    const body: Record<string, unknown> = {};
    if (amount != null) {
      body.amount = { value: Number(amount).toFixed(2), currency_code: 'USD' };
    }

    const data = await this.request<any>(gateway, `/v2/payments/captures/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify(Object.keys(body).length ? body : {}),
    });

    return {
      refundId: data.id ?? transactionId,
      status: data.status ?? 'PENDING',
      amount: data.amount?.value ? Number(data.amount.value) : amount,
      currency: data.amount?.currency_code ?? 'USD',
      raw: data,
    };
  }

  async validateConfiguration(gateway: Gateway) {
    const today = new Date().toISOString().slice(0, 10);
    await this.request<any>(gateway, `/v1/reporting/transactions?start_date=${today}T00:00:00Z&end_date=${today}T23:59:59Z&page_size=1`, {
      method: 'GET',
    });
    return { ok: true, message: 'PayPal configuration is valid' };
  }
}
