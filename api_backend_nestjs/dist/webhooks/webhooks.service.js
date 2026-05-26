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