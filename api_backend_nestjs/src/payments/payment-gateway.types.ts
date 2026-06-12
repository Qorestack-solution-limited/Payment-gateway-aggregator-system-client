import { Gateway, GatewayProvider } from '@prisma/client';

export type GatewaySyncOptions = {
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
};

export type InitializedPayment = {
  reference: string;
  providerReference?: string;
  providerTransactionId?: string;
  providerStatus?: string;
  checkoutUrl?: string;
  accessCode?: string;
  raw: Record<string, unknown>;
};

export type VerifiedPayment = {
  reference: string;
  providerReference?: string;
  providerTransactionId?: string;
  providerStatus?: string;
  amount?: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  paidAt?: string;
  raw: Record<string, unknown>;
};

export type SyncedGatewayTransaction = {
  reference: string;
  providerReference?: string;
  providerTransactionId?: string;
  providerStatus?: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  description?: string;
  paidAt?: string;
  metadata?: Record<string, unknown>;
  raw: Record<string, unknown>;
};

export type RefundResult = {
  refundId: string;
  status: string;
  amount?: number;
  currency?: string;
  raw: Record<string, unknown>;
};

export interface PaymentGatewayAdapter {
  readonly provider: GatewayProvider;
  initializePayment(gateway: Gateway, input: {
    amount: number;
    currency?: string;
    customerName: string;
    customerEmail: string;
    description?: string;
    reference: string;
    metadata?: Record<string, unknown>;
  }): Promise<InitializedPayment>;
  verifyPayment(gateway: Gateway, reference: string): Promise<VerifiedPayment>;
  refundPayment(gateway: Gateway, transactionId: string, amount?: number): Promise<RefundResult>;
  fetchTransactions(gateway: Gateway, options?: GatewaySyncOptions): Promise<SyncedGatewayTransaction[]>;
  validateConfiguration(gateway: Gateway): Promise<{ ok: boolean; message: string }>;
}
