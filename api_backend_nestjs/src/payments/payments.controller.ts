import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@ApiExcludeController()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('webhooks/paystack')
  handlePaystackWebhook(
    @Headers('x-paystack-signature') signature: string | undefined,
    @Req() request: Request & { rawBody?: Buffer },
    @Body() payload: Record<string, any>,
  ) {
    const rawBody = request.rawBody?.toString('utf8') ?? JSON.stringify(payload ?? {});
    return this.payments.handlePaystackWebhook(signature, rawBody, payload);
  }

  @Post('webhooks/flutterwave')
  handleFlutterwaveWebhook(
    @Headers('verif-hash') signature: string | undefined,
    @Req() request: Request & { rawBody?: Buffer },
    @Body() payload: Record<string, any>,
  ) {
    const rawBody = request.rawBody?.toString('utf8') ?? JSON.stringify(payload ?? {});
    return this.payments.handleFlutterwaveWebhook(signature, rawBody, payload);
  }

  @Post('webhooks/stripe')
  handleStripeWebhook(
    @Headers('stripe-signature') signature: string | undefined,
    @Req() request: Request & { rawBody?: Buffer },
    @Body() payload: Record<string, any>,
  ) {
    const rawBody = request.rawBody?.toString('utf8') ?? JSON.stringify(payload ?? {});
    return this.payments.handleStripeWebhook(signature, rawBody, payload);
  }

  @Post('webhooks/paypal')
  handlePayPalWebhook(
    @Headers('paypal-auth-algo') secret: string | undefined,
    @Req() request: Request & { rawBody?: Buffer },
    @Body() payload: Record<string, any>,
  ) {
    const rawBody = request.rawBody?.toString('utf8') ?? JSON.stringify(payload ?? {});
    return this.payments.handlePayPalWebhook(secret, rawBody, payload);
  }
}
