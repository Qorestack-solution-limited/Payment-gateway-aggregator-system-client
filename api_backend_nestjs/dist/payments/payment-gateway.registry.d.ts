import { Gateway, GatewayProvider } from '@prisma/client';
import { PaystackAdapter } from './providers/paystack.adapter';
import { PaymentGatewayAdapter } from './payment-gateway.types';
export declare class PaymentGatewayRegistry {
    private readonly paystack;
    constructor(paystack: PaystackAdapter);
    getAdapter(provider: GatewayProvider): PaymentGatewayAdapter;
    forGateway(gateway: Gateway): PaymentGatewayAdapter;
}
