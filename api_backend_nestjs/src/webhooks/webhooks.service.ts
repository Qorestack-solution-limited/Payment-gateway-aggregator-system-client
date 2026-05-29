import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  private signPayload(secret: string, timestamp: string, payload: string) {
    return crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  }

  private async wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async assertOwnership(id: string, orgId: string) {
    const wh = await this.prisma.webhook.findUnique({ where: { id } });
    if (!wh) throw new NotFoundException('Webhook not found');
    if (wh.organizationId !== orgId) throw new ForbiddenException();
    return wh;
  }

  findAll(orgId: string) {
    return this.prisma.webhook.findMany({
      where: { organizationId: orgId },
      include: { deliveries: { orderBy: { deliveredAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, orgId: string) {
    return this.assertOwnership(id, orgId);
  }

  create(orgId: string, dto: CreateWebhookDto) {
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    return this.prisma.webhook.create({
      data: { ...dto, secret, organizationId: orgId },
    });
  }

  async update(id: string, orgId: string, dto: UpdateWebhookDto) {
    await this.assertOwnership(id, orgId);
    return this.prisma.webhook.update({ where: { id }, data: dto });
  }

  async remove(id: string, orgId: string) {
    await this.assertOwnership(id, orgId);
    await this.prisma.webhook.delete({ where: { id } });
    return { message: 'Webhook removed' };
  }

  async getDeliveries(id: string, orgId: string) {
    await this.assertOwnership(id, orgId);
    return this.prisma.webhookDelivery.findMany({
      where: { webhookId: id },
      orderBy: { deliveredAt: 'desc' },
      take: 50,
    });
  }

  async sendTestEvent(id: string, orgId: string) {
    const webhook = await this.assertOwnership(id, orgId);

    const testPayload = {
      id: `evt_test_${crypto.randomBytes(12).toString('hex')}`,
      event: 'payment.test',
      data: {
        reference: 'txn_test_demo',
        amount: 10000,
        currency: 'NGN',
        status: 'SUCCESS',
        customerName: 'Test Customer',
        customerEmail: 'test@payorchestra.com',
      },
      createdAt: new Date().toISOString(),
    };

    await this.deliverWebhook(webhook, 'payment.test', testPayload);

    return this.prisma.webhookDelivery.findFirst({
      where: { webhookId: id },
      orderBy: { deliveredAt: 'desc' },
    });
  }

  async dispatchEvent(orgId: string, event: string, data: unknown) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
        events: { has: event },
      },
    });

    if (webhooks.length === 0) return;

    const payload = {
      id: `evt_${crypto.randomBytes(12).toString('hex')}`,
      event,
      data,
      createdAt: new Date().toISOString(),
    };

    await Promise.allSettled(webhooks.map((webhook) => this.deliverWebhook(webhook, event, payload)));
  }

  private async deliverWebhook(
    webhook: { id: string; url: string; secret: string },
    event: string,
    payload: unknown,
  ) {
    const body = JSON.stringify(payload);
    let attempt = 0;

    while (attempt < 3) {
      attempt += 1;
      const timestamp = Date.now().toString();
      const signature = this.signPayload(webhook.secret, timestamp, body);

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-payorchestra-event': event,
            'x-payorchestra-timestamp': timestamp,
            'x-payorchestra-signature': signature,
          },
          body,
        });

        const responseText = await response.text();

        await this.prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            statusCode: response.status,
            response: responseText.slice(0, 5000),
          },
        });

        if (response.ok) {
          return;
        }
      } catch (error) {
        await this.prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            statusCode: 0,
            response: error instanceof Error ? error.message.slice(0, 5000) : 'Unknown webhook error',
          },
        });
      }

      if (attempt < 3) {
        await this.wait(500 * attempt);
      }
    }
  }
}
