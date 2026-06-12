import { Module } from '@nestjs/common';
import { PaymentLinksController } from './payment-links.controller';
import { PaymentLinksPublicController } from './payment-links-public.controller';
import { PaymentLinksService } from './payment-links.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsModule],
  controllers: [PaymentLinksController, PaymentLinksPublicController],
  providers: [PaymentLinksService],
  exports: [PaymentLinksService],
})
export class PaymentLinksModule {}
