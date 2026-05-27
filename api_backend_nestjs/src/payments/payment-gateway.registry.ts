import { Injectable, NotImplementedException } from '@nestjs/common';
import { Gateway, GatewayProvider } from '@prisma/client';
import { FlutterwaveAdapter } from './providers/flutterwave.adapter';
import { PaystackAdapter } from './providers/paystack.adapter';
import { PayPalAdapter } from './providers/paypal.adapter';
import { StripeAdapter } from './providers/stripe.adapter';
import { PaymentGatewayAdapter } from './payment-gateway.types';

@Injectable()
export class PaymentGatewayRegistry {
  constructor(
    private readonly paystack: PaystackAdapter,
    private readonly flutterwave: FlutterwaveAdapter,
    private readonly stripe: StripeAdapter,
    private readonly paypal: PayPalAdapter,
  ) {}

  getAdapter(provider: GatewayProvider): PaymentGatewayAdapter {
    switch (provider) {
      case GatewayProvider.STRIPE:
        return this.stripe;
      case GatewayProvider.PAYPAL:
        return this.paypal;
      case GatewayProvider.PAYSTACK:
        return this.paystack;
      case GatewayProvider.FLUTTERWAVE:
        return this.flutterwave;
      default:
        throw new NotImplementedException(`${provider} integration is not implemented yet`);
    }
  }

  forGateway(gateway: Gateway): PaymentGatewayAdapter {
    return this.getAdapter(gateway.provider);
  }
}
