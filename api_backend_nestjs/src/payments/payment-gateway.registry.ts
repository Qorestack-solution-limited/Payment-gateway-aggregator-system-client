import { Injectable, NotImplementedException } from '@nestjs/common';
import { Gateway, GatewayProvider } from '@prisma/client';
import { PaystackAdapter } from './providers/paystack.adapter';
import { PaymentGatewayAdapter } from './payment-gateway.types';

@Injectable()
export class PaymentGatewayRegistry {
  constructor(private readonly paystack: PaystackAdapter) {}

  getAdapter(provider: GatewayProvider): PaymentGatewayAdapter {
    switch (provider) {
      case GatewayProvider.PAYSTACK:
        return this.paystack;
      default:
        throw new NotImplementedException(`${provider} integration is not implemented yet`);
    }
  }

  forGateway(gateway: Gateway): PaymentGatewayAdapter {
    return this.getAdapter(gateway.provider);
  }
}
