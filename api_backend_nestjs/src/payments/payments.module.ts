import { Module } from '@nestjs/common';
import { PaystackAdapter } from './providers/paystack.adapter';
import { PaymentGatewayRegistry } from './payment-gateway.registry';

@Module({
  providers: [PaystackAdapter, PaymentGatewayRegistry],
  exports: [PaystackAdapter, PaymentGatewayRegistry],
})
export class PaymentsModule {}
