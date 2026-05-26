import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';
import { PaymentsModule } from '../payments/payments.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [PaymentsModule, WebhooksModule],
  controllers: [GatewaysController],
  providers: [GatewaysService],
})
export class GatewaysModule {}
