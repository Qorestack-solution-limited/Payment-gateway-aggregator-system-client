"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackAdapter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PaystackAdapter = class PaystackAdapter {
    constructor() {
        this.provider = client_1.GatewayProvider.PAYSTACK;
        this.baseUrl = 'https://api.paystack.co';
    }
    getSecretKey(gateway) {
        if (!gateway.secretKey) {
            throw new common_1.BadRequestException(`Gateway ${gateway.name} is missing a secret key`);
        }
        return gateway.secretKey;
    }
    async request(gateway, path, options = {}) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.getSecretKey(gateway)}`,
                'Content-Type': 'application/json',
                ...(options.headers ?? {}),
            },
        });
        const payload = (await response.json());
        if (!response.ok || !payload.status) {
            if (response.status === 401) {
                throw new common_1.UnauthorizedException(payload?.message || 'Paystack credentials rejected');
            }
            throw new common_1.BadRequestException(payload?.message || 'Paystack request failed');
        }
        return payload.data;
    }
    async initializePayment(gateway, input) {
        const amount = Math.round(Number(input.amount) * 100);
        const data = await this.request(gateway, '/transaction/initialize', {
            method: 'POST',
            body: JSON.stringify({
                amount: String(amount),
                email: input.customerEmail,
                currency: input.currency ?? 'NGN',
                reference: input.reference,
                metadata: {
                    customerName: input.customerName,
                    description: input.description,
                    gatewayId: gateway.id,
                    ...(input.metadata ?? {}),
                },
            }),
        });
        return {
            reference: data.reference,
            providerReference: data.reference,
            providerStatus: 'pending',
            checkoutUrl: data.authorization_url,
            accessCode: data.access_code,
            raw: data,
        };
    }
    async verifyPayment(gateway, reference) {
        const data = await this.request(gateway, `/transaction/verify/${reference}`, {
            method: 'GET',
        });
        return {
            reference: data.reference,
            providerReference: data.reference,
            providerTransactionId: data.id ? String(data.id) : undefined,
            providerStatus: data.status,
            amount: Number(data.amount ?? 0) / 100,
            currency: data.currency ?? 'NGN',
            customerName: data.metadata?.customerName ?? data.customer?.first_name ?? data.customer?.name ?? 'Customer',
            customerEmail: data.customer?.email ?? '',
            paidAt: data.paid_at ?? data.paidAt ?? data.createdAt,
            raw: data,
        };
    }
    async fetchTransactions(gateway, options = {}) {
        const query = new URLSearchParams();
        if (options.page)
            query.set('page', String(options.page));
        if (options.perPage)
            query.set('perPage', String(options.perPage));
        if (options.from)
            query.set('from', options.from);
        if (options.to)
            query.set('to', options.to);
        const suffix = query.toString() ? `?${query.toString()}` : '';
        const data = await this.request(gateway, `/transaction${suffix}`, { method: 'GET' });
        return data.map((item) => ({
            reference: item.reference,
            providerReference: item.reference,
            providerTransactionId: item.id ? String(item.id) : undefined,
            providerStatus: item.status,
            amount: Number(item.amount ?? 0) / 100,
            currency: item.currency ?? 'NGN',
            customerName: item.metadata?.customerName ??
                item.customer?.name ??
                ([item.customer?.first_name, item.customer?.last_name].filter(Boolean).join(' ') || 'Customer'),
            customerEmail: item.customer?.email ?? '',
            description: item.metadata?.description ?? item.message,
            paidAt: item.paid_at ?? item.paidAt ?? item.createdAt,
            metadata: item.metadata ?? {},
            raw: item,
        }));
    }
    async refundPayment(gateway, transactionId, amount) {
        const body = { transaction: transactionId };
        if (amount != null)
            body.amount = Math.round(Number(amount) * 100);
        const data = await this.request(gateway, '/refund', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return {
            refundId: String(data.id ?? data.transaction ?? transactionId),
            status: data.status ?? 'pending',
            amount: data.amount != null ? Number(data.amount) / 100 : amount,
            currency: data.currency ?? 'NGN',
            raw: data,
        };
    }
    async validateConfiguration(gateway) {
        await this.request(gateway, '/transaction?perPage=1', { method: 'GET' });
        return { ok: true, message: 'Paystack configuration is valid' };
    }
};
exports.PaystackAdapter = PaystackAdapter;
exports.PaystackAdapter = PaystackAdapter = __decorate([
    (0, common_1.Injectable)()
], PaystackAdapter);
//# sourceMappingURL=paystack.adapter.js.map