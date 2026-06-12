import { Module } from '@nestjs/common';
import { SyncSchedulerService } from './sync-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [PrismaModule, PaymentsModule, WebhooksModule],
  providers: [SyncSchedulerService],
})
export class SyncSchedulerModule {}
