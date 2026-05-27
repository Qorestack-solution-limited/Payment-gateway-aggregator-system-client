import { Gateway, GatewayProvider } from '@prisma/client';
import { FlutterwaveAdapter } from './providers/flutterwave.adapter';
import { PaystackAdapter } from './providers/paystack.adapter';
import { PayPalAdapter } from './providers/paypal.adapter';
import { StripeAdapter } from './providers/stripe.adapter';
import { PaymentGatewayAdapter } from './payment-gateway.types';
export declare class PaymentGatewayRegistry {
    private readonly paystack;
    private readonly flutterwave;
    private readonly stripe;
    private readonly paypal;
    constructor(paystack: PaystackAdapter, flutterwave: FlutterwaveAdapter, stripe: StripeAdapter, paypal: PayPalAdapter);
    getAdapter(provider: GatewayProvider): PaymentGatewayAdapter;
    forGateway(gateway: Gateway): PaymentGatewayAdapter;
}
