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
const audit_service_1 = require("../audit/audit.service");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const client_2 = require("@prisma/client");
const payment_gateway_registry_1 = require("../payments/payment-gateway.registry");
const gateway_credentials_service_1 = require("../payments/gateway-credentials.service");
const webhooks_service_1 = require("../webhooks/webhooks.service");
let GatewaysService = class GatewaysService {
    constructor(prisma, registry, credentials, webhooks, audit) {
        this.prisma = prisma;
        this.registry = registry;
        this.credentials = credentials;
        this.webhooks = webhooks;
        this.audit = audit;
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
        return this.prisma.gateway.findFirst({
            where: { id, organizationId: orgId },
            include: {
                _count: {
                    select: {
                        transactions: true,
                        providerWebhookEvents: true,
                        syncRuns: true,
                    },
                },
            },
        }).then((gateway) => {
            if (!gateway)
                throw new common_1.NotFoundException('Gateway not found');
            return {
                ...this.serializeGateway(gateway),
                transactionCount: gateway._count.transactions,
                webhookEventCount: gateway._count.providerWebhookEvents,
                syncRunCount: gateway._count.syncRuns,
            };
        });
    }
    async getWebhookEvents(id, orgId) {
        await this.assertOwnership(id, orgId);
        return this.prisma.providerWebhookEvent.findMany({
            where: { gatewayId: id, organizationId: orgId },
            orderBy: { receivedAt: 'desc' },
            take: 25,
            include: {
                transaction: {
                    select: {
                        id: true,
                        reference: true,
                        status: true,
                        amount: true,
                        currency: true,
                    },
                },
            },
        });
    }
    async getSyncRuns(id, orgId) {
        await this.assertOwnership(id, orgId);
        return this.prisma.gatewaySyncRun.findMany({
            where: { gatewayId: id, organizationId: orgId },
            orderBy: { startedAt: 'desc' },
            take: 25,
        });
    }
    create(orgId, dto) {
        return this.prisma.gateway.create({
            data: { ...this.credentials.prepareCreateData(dto), organizationId: orgId },
        }).then((gateway) => ({
            ...this.serializeGateway(gateway),
            transactionCount: 0,
        }));
    }
    async validate(id, orgId) {
        const gateway = this.credentials.hydrateGateway(await this.assertOwnership(id, orgId));
        const adapter = this.registry.forGateway(gateway);
        return adapter.validateConfiguration(gateway);
    }
    async syncTransactions(id, orgId, dto) {
        const gateway = this.credentials.hydrateGateway(await this.assertOwnership(id, orgId));
        const adapter = this.registry.forGateway(gateway);
        const startedAt = new Date();
        try {
            const providerTransactions = await adapter.fetchTransactions(gateway, dto);
            let imported = 0;
            let updated = 0;
            for (const item of providerTransactions) {
                const statusMap = {
                    success: client_2.TransactionStatus.SUCCESS,
                    failed: client_2.TransactionStatus.FAILED,
                    abandoned: client_2.TransactionStatus.FAILED,
                    pending: client_2.TransactionStatus.PENDING,
                    processing: client_2.TransactionStatus.PENDING,
                    refunded: client_2.TransactionStatus.REFUNDED,
                };
                const normalizedStatus = statusMap[String(item.providerStatus ?? '').toLowerCase()] ?? client_2.TransactionStatus.PENDING;
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
            await this.prisma.gatewaySyncRun.create({
                data: {
                    gatewayId: gateway.id,
                    organizationId: orgId,
                    status: 'SUCCESS',
                    imported,
                    updated,
                    totalFetched: providerTransactions.length,
                    message: `Imported ${imported}, updated ${updated}`,
                    fromDate: dto.from,
                    toDate: dto.to,
                    startedAt,
                    completedAt: new Date(),
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
            await this.prisma.gatewaySyncRun.create({
                data: {
                    gatewayId: gateway.id,
                    organizationId: orgId,
                    status: 'FAILED',
                    imported: 0,
                    updated: 0,
                    totalFetched: 0,
                    message: error instanceof Error ? error.message : 'Sync failed',
                    fromDate: dto.from,
                    toDate: dto.to,
                    startedAt,
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }
    async update(id, orgId, dto) {
        await this.assertOwnership(id, orgId);
        return this.prisma.gateway
            .update({ where: { id }, data: this.credentials.prepareUpdateData(dto) })
            .then((gateway) => this.serializeGateway(gateway));
    }
    async toggleStatus(id, orgId, actorId, actorEmail) {
        const gw = await this.assertOwnership(id, orgId);
        const next = gw.status === client_2.GatewayStatus.ACTIVE ? client_2.GatewayStatus.INACTIVE : client_2.GatewayStatus.ACTIVE;
        const updated = await this.prisma.gateway
            .update({ where: { id }, data: { status: next } })
            .then((gateway) => this.serializeGateway(gateway));
        if (actorId && actorEmail) {
            this.audit.log({
                action: client_1.AuditAction.GATEWAY_TOGGLED,
                actorId, actorEmail, organizationId: orgId,
                resourceType: 'gateway', resourceId: id,
                description: `Gateway "${gw.name}" toggled to ${next}`,
                before: { status: gw.status }, after: { status: next },
            }).catch(() => { });
        }
        return updated;
    }
    async remove(id, orgId, actorId, actorEmail) {
        const gw = await this.assertOwnership(id, orgId);
        await this.prisma.gateway.delete({ where: { id } });
        if (actorId && actorEmail) {
            this.audit.log({
                action: client_1.AuditAction.GATEWAY_DELETED,
                actorId, actorEmail, organizationId: orgId,
                resourceType: 'gateway', resourceId: id,
                description: `Gateway "${gw.name}" deleted`,
            }).catch(() => { });
        }
        return { message: 'Gateway removed' };
    }
};
exports.GatewaysService = GatewaysService;
exports.GatewaysService = GatewaysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_gateway_registry_1.PaymentGatewayRegistry,
        gateway_credentials_service_1.GatewayCredentialsService,
        webhooks_service_1.WebhooksService,
        audit_service_1.AuditService])
], GatewaysService);
//# sourceMappingURL=gateways.service.js.map