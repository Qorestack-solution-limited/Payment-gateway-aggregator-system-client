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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const payment_gateway_registry_1 = require("../payments/payment-gateway.registry");
let TransactionsService = class TransactionsService {
    constructor(prisma, webhooks, gateways) {
        this.prisma = prisma;
        this.webhooks = webhooks;
        this.gateways = gateways;
    }
    hashRequest(orgId, dto) {
        return (0, crypto_1.createHash)('sha256').update(JSON.stringify({ orgId, dto })).digest('hex');
    }
    async findAll(orgId, query) {
        const { page = 1, limit = 20, search, status, gatewayId, provider, from, to } = query;
        const skip = (page - 1) * limit;
        const where = { organizationId: orgId };
        if (status)
            where.status = status;
        if (gatewayId)
            where.gatewayId = gatewayId;
        if (provider) {
            where.gateway = {
                provider,
            };
        }
        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerEmail: { contains: search, mode: 'insensitive' } },
                { reference: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { gateway: { select: { name: true, provider: true } } },
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, orgId) {
        const tx = await this.prisma.transaction.findUnique({
            where: { id },
            include: { gateway: true },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        if (tx.organizationId !== orgId)
            throw new common_1.ForbiddenException();
        return tx;
    }
    async findByReference(reference, orgId) {
        const tx = await this.prisma.transaction.findFirst({
            where: { reference, organizationId: orgId },
            include: { gateway: true },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        return tx;
    }
    async create(orgId, dto, idempotencyKey) {
        const requestHash = idempotencyKey ? this.hashRequest(orgId, dto) : null;
        if (idempotencyKey) {
            const existing = await this.prisma.idempotencyRequest.findUnique({
                where: {
                    organizationId_key_path: {
                        organizationId: orgId,
                        key: idempotencyKey,
                        path: '/transactions',
                    },
                },
            });
            if (existing) {
                if (existing.requestHash !== requestHash) {
                    throw new common_1.ConflictException('Idempotency key has already been used with a different payload');
                }
                return existing.response;
            }
        }
        const gateway = await this.prisma.gateway.findFirst({
            where: { id: dto.gatewayId, organizationId: orgId, status: client_1.GatewayStatus.ACTIVE },
        });
        if (!gateway)
            throw new common_1.NotFoundException('Gateway not found');
        const reference = dto.reference || cryptoRandomReference();
        const adapter = this.gateways.forGateway(gateway);
        const initialized = await adapter.initializePayment(gateway, {
            amount: dto.amount,
            currency: dto.currency,
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            description: dto.description,
            reference,
            metadata: dto.metadata,
        });
        const created = await this.prisma.transaction.create({
            data: {
                amount: dto.amount,
                currency: dto.currency ?? 'NGN',
                customerName: dto.customerName,
                customerEmail: dto.customerEmail,
                description: dto.description,
                reference: initialized.reference || reference,
                providerReference: initialized.providerReference,
                providerTransactionId: initialized.providerTransactionId,
                providerStatus: initialized.providerStatus,
                providerPayload: initialized.raw,
                metadata: {
                    ...(dto.metadata ?? {}),
                    checkoutUrl: initialized.checkoutUrl,
                    accessCode: initialized.accessCode,
                },
                gatewayId: dto.gatewayId,
                organizationId: orgId,
            },
            include: { gateway: true },
        });
        if (idempotencyKey && requestHash) {
            await this.prisma.idempotencyRequest.create({
                data: {
                    organizationId: orgId,
                    key: idempotencyKey,
                    path: '/transactions',
                    requestHash,
                    response: JSON.parse(JSON.stringify({
                        ...created,
                        checkoutUrl: initialized.checkoutUrl,
                        accessCode: initialized.accessCode,
                    })),
                },
            });
        }
        await this.webhooks.dispatchEvent(orgId, 'payment.created', created);
        return {
            ...created,
            checkoutUrl: initialized.checkoutUrl,
            accessCode: initialized.accessCode,
        };
    }
    async verify(id, orgId) {
        const tx = await this.findOne(id, orgId);
        const adapter = this.gateways.forGateway(tx.gateway);
        const verified = await adapter.verifyPayment(tx.gateway, tx.providerReference || tx.reference);
        const statusMap = {
            success: client_1.TransactionStatus.SUCCESS,
            failed: client_1.TransactionStatus.FAILED,
            abandoned: client_1.TransactionStatus.FAILED,
            pending: client_1.TransactionStatus.PENDING,
            processing: client_1.TransactionStatus.PENDING,
            refunded: client_1.TransactionStatus.REFUNDED,
        };
        const nextStatus = statusMap[String(verified.providerStatus ?? '').toLowerCase()] ?? tx.status;
        const updated = await this.prisma.transaction.update({
            where: { id: tx.id },
            data: {
                reference: verified.reference || tx.reference,
                providerReference: verified.providerReference,
                providerTransactionId: verified.providerTransactionId,
                providerStatus: verified.providerStatus,
                providerPayload: verified.raw,
                status: nextStatus,
                amount: verified.amount ?? tx.amount,
                currency: verified.currency ?? tx.currency,
                customerName: verified.customerName ?? tx.customerName,
                customerEmail: verified.customerEmail ?? tx.customerEmail,
                lastSyncedAt: new Date(),
            },
            include: { gateway: true },
        });
        await this.webhooks.dispatchEvent(orgId, `payment.${nextStatus.toLowerCase()}`, {
            previousStatus: tx.status,
            transaction: updated,
        });
        return updated;
    }
    async updateStatus(id, orgId, status) {
        const tx = await this.findOne(id, orgId);
        const updated = await this.prisma.transaction.update({ where: { id }, data: { status } });
        await this.webhooks.dispatchEvent(orgId, `payment.${status.toLowerCase()}`, {
            previousStatus: tx.status,
            transaction: updated,
        });
        return updated;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        webhooks_service_1.WebhooksService,
        payment_gateway_registry_1.PaymentGatewayRegistry])
], TransactionsService);
function cryptoRandomReference() {
    return `txn_${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
}
//# sourceMappingURL=transactions.service.js.map