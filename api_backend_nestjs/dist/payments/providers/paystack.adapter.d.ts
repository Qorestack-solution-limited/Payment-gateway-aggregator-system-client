import { Gateway } from '@prisma/client';
import { GatewaySyncOptions, InitializedPayment, PaymentGatewayAdapter, SyncedGatewayTransaction, VerifiedPayment } from '../payment-gateway.types';
export declare class PaystackAdapter implements PaymentGatewayAdapter {
    readonly provider: "PAYSTACK";
    private readonly baseUrl;
    private getSecretKey;
    private request;
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
    fetchTransactions(gateway: Gateway, options?: GatewaySyncOptions): Promise<SyncedGatewayTransaction[]>;
    validateConfiguration(gateway: Gateway): Promise<{
        ok: boolean;
        message: string;
    }>;
}
