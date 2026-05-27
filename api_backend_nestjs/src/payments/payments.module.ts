import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { GatewayCredentialsService } from './gateway-credentials.service';
import { FlutterwaveAdapter } from './providers/flutterwave.adapter';
import { PaystackAdapter } from './providers/paystack.adapter';
import { PayPalAdapter } from './providers/paypal.adapter';
import { StripeAdapter } from './providers/stripe.adapter';
import { PaymentGatewayRegistry } from './payment-gateway.registry';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule, WebhooksModule],
  controllers: [PaymentsController],
  providers: [GatewayCredentialsService, PaystackAdapter, FlutterwaveAdapter, StripeAdapter, PayPalAdapter, PaymentGatewayRegistry, PaymentsService],
  exports: [GatewayCredentialsService, PaystackAdapter, FlutterwaveAdapter, StripeAdapter, PayPalAdapter, PaymentGatewayRegistry, PaymentsService],
})
export class PaymentsModule {}
