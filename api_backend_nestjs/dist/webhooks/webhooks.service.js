"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let WebhooksService = class WebhooksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    signPayload(secret, timestamp, payload) {
        return crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
    }
    async wait(ms) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
    async assertOwnership(id, orgId) {
        const wh = await this.prisma.webhook.findUnique({ where: { id } });
        if (!wh)
            throw new common_1.NotFoundException('Webhook not found');
        if (wh.organizationId !== orgId)
            throw new common_1.ForbiddenException();
        return wh;
    }
    findAll(orgId) {
        return this.prisma.webhook.findMany({
            where: { organizationId: orgId },
            include: { deliveries: { orderBy: { deliveredAt: 'desc' }, take: 5 } },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id, orgId) {
        return this.assertOwnership(id, orgId);
    }
    create(orgId, dto) {
        const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
        return this.prisma.webhook.create({
            data: { ...dto, secret, organizationId: orgId },
        });
    }
    async update(id, orgId, dto) {
        await this.assertOwnership(id, orgId);
        return this.prisma.webhook.update({ where: { id }, data: dto });
    }
    async remove(id, orgId) {
        await this.assertOwnership(id, orgId);
        await this.prisma.webhook.delete({ where: { id } });
        return { message: 'Webhook removed' };
    }
    async getDeliveries(id, orgId) {
        await this.assertOwnership(id, orgId);
        return this.prisma.webhookDelivery.findMany({
            where: { webhookId: id },
            orderBy: { deliveredAt: 'desc' },
            take: 50,
        });
    }
    async retryDelivery(deliveryId, orgId) {
        const delivery = await this.prisma.webhookDelivery.findUnique({
            where: { id: deliveryId },
            include: { webhook: true },
        });
        if (!delivery)
            throw new common_1.NotFoundException('Delivery record not found');
        if (delivery.webhook.organizationId !== orgId)
            throw new common_1.ForbiddenException();
        const testPayload = {
            id: `evt_retry_${crypto.randomBytes(8).toString('hex')}`,
            event: delivery.event,
            retryOf: deliveryId,
            createdAt: new Date().toISOString(),
        };
        await this.deliverWebhook(delivery.webhook, delivery.event, testPayload);
        return this.prisma.webhookDelivery.findFirst({
            where: { webhookId: delivery.webhookId },
            orderBy: { deliveredAt: 'desc' },
        });
    }
    async scheduleFailedRetries() {
        const due = await this.prisma.webhookDelivery.findMany({
            where: {
                statusCode: { notIn: [200, 201, 202, 204] },
                nextRetryAt: { lte: new Date() },
                retryCount: { lt: 5 },
                webhook: { isActive: true },
            },
            include: { webhook: true },
            take: 50,
        });
        for (const delivery of due) {
            if (!delivery.webhook?.isActive)
                continue;
            const payload = {
                id: `evt_autoretry_${crypto.randomBytes(8).toString('hex')}`,
                event: delivery.event,
                retryOf: delivery.id,
                retryCount: delivery.retryCount + 1,
                createdAt: new Date().toISOString(),
            };
            await this.deliverWebhook(delivery.webhook, delivery.event, payload);
            const backoffMs = Math.min(60_000 * Math.pow(2, delivery.retryCount), 2 * 60 * 60 * 1000);
            await this.prisma.webhookDelivery.update({
                where: { id: delivery.id },
                data: {
                    retryCount: { increment: 1 },
                    nextRetryAt: delivery.retryCount + 1 < 5 ? new Date(Date.now() + backoffMs) : null,
                },
            });
        }
    }
    async sendTestEvent(id, orgId) {
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
    async dispatchEvent(orgId, event, data) {
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                organizationId: orgId,
                isActive: true,
                events: { has: event },
            },
        });
        if (webhooks.length === 0)
            return;
        const payload = {
            id: `evt_${crypto.randomBytes(12).toString('hex')}`,
            event,
            data,
            createdAt: new Date().toISOString(),
        };
        await Promise.allSettled(webhooks.map((webhook) => this.deliverWebhook(webhook, event, payload)));
    }
    async deliverWebhook(webhook, event, payload) {
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
            }
            catch (error) {
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
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map