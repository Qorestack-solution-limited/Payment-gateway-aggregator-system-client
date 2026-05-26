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
exports.GatewaysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const payment_gateway_registry_1 = require("../payments/payment-gateway.registry");
const webhooks_service_1 = require("../webhooks/webhooks.service");
let GatewaysService = class GatewaysService {
    constructor(prisma, registry, webhooks) {
        this.prisma = prisma;
        this.registry = registry;
        this.webhooks = webhooks;
    }
    async assertOwnership(gatewayId, orgId) {
        const gw = await this.prisma.gateway.findUnique({ where: { id: gatewayId } });
        if (!gw)
            throw new common_1.NotFoundException('Gateway not found');
        if (gw.organizationId !== orgId)
            throw new common_1.ForbiddenException();
        return gw;
    }
    serializeGateway(gateway) {
        const { secretKey, webhookSecret, ...rest } = gateway;
        return {
            ...rest,
            hasSecretKey: Boolean(secretKey),
            hasWebhookSecret: Boolean(webhookSecret),
        };
    }
    findAll(orgId) {
        return this.prisma.gateway.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { transactions: true },
                },
            },
        }).then((gateways) => gateways.map((gateway) => ({
            ...this.serializeGateway(gateway),
            transactionCount: gateway._count.transactions,
        })));
    }
    findOne(id, orgId) {
        return this.assertOwnership(id, orgId).then((gateway) => this.serializeGateway(gateway));
    }
    create(orgId, dto) {
        return this.prisma.gateway.create({
            data: { ...dto, organizationId: orgId },
        }).then((gateway) => ({
            ...this.serializeGateway(gateway),
            transactionCount: 0,
        }));
    }
    async validate(id, orgId) {
        const gateway = await this.assertOwnership(id, orgId);
        const adapter = this.registry.forGateway(gateway);
        return adapter.validateConfiguration(gateway);
    }
    async syncTransactions(id, orgId, dto) {
        const gateway = await this.assertOwnership(id, orgId);
        const adapter = this.registry.forGateway(gateway);
        try {
            const providerTransactions = await adapter.fetchTransactions(gateway, dto);
            let imported = 0;
            let updated = 0;
            for (const item of providerTransactions) {
                const statusMap = {
                    success: client_1.TransactionStatus.SUCCESS,
                    failed: client_1.TransactionStatus.FAILED,
                    abandoned: client_1.TransactionStatus.FAILED,
                    pending: client_1.TransactionStatus.PENDING,
                    processing: client_1.TransactionStatus.PENDING,
                    refunded: client_1.TransactionStatus.REFUNDED,
                };
                const normalizedStatus = statusMap[String(item.providerStatus ?? '').toLowerCase()] ?? client_1.TransactionStatus.PENDING;
                const existing = await this.prisma.transaction.findFirst({
                    where: {
                        organizationId: orgId,
                        OR: [
                            { reference: item.reference },
                            item.providerTransactionId ? { providerTransactionId: item.providerTransactionId } : undefined,
                        ].filter(Boolean),
                    },
                });
                if (existing) {
                    await this.prisma.transaction.update({
                        where: { id: existing.id },
                        data: {
                            providerReference: item.providerReference,
                            providerTransactionId: item.providerTransactionId,
                            providerStatus: item.providerStatus,
                            providerPayload: item.raw,
                            amount: item.amount,
                            currency: item.currency,
                            customerName: item.customerName,
                            customerEmail: item.customerEmail,
                            description: item.description,
                            metadata: item.metadata,
                            status: normalizedStatus,
                            syncedFromProvider: true,
                            lastSyncedAt: new Date(),
                        },
                    });
                    updated += 1;
                    continue;
                }
                await this.prisma.transaction.create({
                    data: {
                        reference: item.reference,
                        providerReference: item.providerReference,
                        providerTransactionId: item.providerTransactionId,
                        providerStatus: item.providerStatus,
                        providerPayload: item.raw,
                        amount: item.amount,
                        currency: item.currency,
                        customerName: item.customerName,
                        customerEmail: item.customerEmail,
                        description: item.description,
                        metadata: item.metadata,
                        gatewayId: gateway.id,
                        organizationId: orgId,
                        status: normalizedStatus,
                        syncedFromProvider: true,
                        lastSyncedAt: new Date(),
                    },
                });
                imported += 1;
            }
            await this.prisma.gateway.update({
                where: { id: gateway.id },
                data: {
                    lastSyncedAt: new Date(),
                    lastSyncStatus: 'SUCCESS',
                    lastSyncMessage: `Imported ${imported}, updated ${updated}`,
                },
            });
            await this.webhooks.dispatchEvent(orgId, 'gateway.sync.completed', {
                gatewayId: gateway.id,
                gatewayName: gateway.name,
                imported,
                updated,
            });
            return {
                gatewayId: gateway.id,
                imported,
                updated,
                totalFetched: providerTransactions.length,
                message: `Imported ${imported} and updated ${updated} transaction(s) from ${gateway.name}.`,
            };
        }
        catch (error) {
            await this.prisma.gateway.update({
                where: { id: gateway.id },
                data: {
                    lastSyncedAt: new Date(),
                    lastSyncStatus: 'FAILED',
                    lastSyncMessage: error instanceof Error ? error.message : 'Sync failed',
                },
            });
            throw error;
        }
    }
    async update(id, orgId, dto) {
        await this.assertOwnership(id, orgId);
        return this.prisma.gateway.update({ where: { id }, data: dto }).then((gateway) => this.serializeGateway(gateway));
    }
    async toggleStatus(id, orgId) {
        const gw = await this.assertOwnership(id, orgId);
        const next = gw.status === client_1.GatewayStatus.ACTIVE ? client_1.GatewayStatus.INACTIVE : client_1.GatewayStatus.ACTIVE;
        return this.prisma.gateway
            .update({ where: { id }, data: { status: next } })
            .then((gateway) => this.serializeGateway(gateway));
    }
    async remove(id, orgId) {
        await this.assertOwnership(id, orgId);
        await this.prisma.gateway.delete({ where: { id } });
        return { message: 'Gateway removed' };
    }
};
exports.GatewaysService = GatewaysService;
exports.GatewaysService = GatewaysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_gateway_registry_1.PaymentGatewayRegistry,
        webhooks_service_1.WebhooksService])
], GatewaysService);
//# sourceMappingURL=gateways.service.js.map