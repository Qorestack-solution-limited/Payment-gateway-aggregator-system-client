import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { PaymentLinksService } from './payment-links.service';
import { TransactionsService } from '../transactions/transactions.service';

@ApiExcludeController()
@Controller('pay')
export class PaymentLinksPublicController {
  constructor(
    private links: PaymentLinksService,
    private txs: TransactionsService,
  ) {}

  @Get(':slug')
  getLink(@Param('slug') slug: string) {
    return this.links.findBySlug(slug);
  }

  @Post(':slug/checkout')
  @HttpCode(200)
  async checkout(
    @Param('slug') slug: string,
    @Body() body: { customerName: string; customerEmail: string; amount?: number },
  ) {
    const link = await this.links.findBySlug(slug);

    const amount = link.amount ? Number(link.amount) : body.amount;
    if (!amount || amount <= 0) {
      throw new Error('Amount is required for variable-amount payment links');
    }

    if (!link.gatewayId) {
      throw new Error('No gateway configured for this payment link');
    }

    const result = await this.txs.create(
      link.organizationId,
      {
        gatewayId: link.gatewayId,
        amount,
        currency: link.currency,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        description: link.title,
        metadata: { paymentLinkId: link.id, paymentLinkSlug: link.slug } as any,
      },
    );

    await this.links.incrementUseCount(link.id);

    return {
      ...(result as object),
      redirectUrl: link.redirectUrl,
    };
  }
}
