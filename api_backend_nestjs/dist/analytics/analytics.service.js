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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(orgId, days = 30) {
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const prevFrom = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);
        const [current, previous] = await Promise.all([
            this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: from } } }),
            this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: prevFrom, lt: from } } }),
        ]);
        const success = (txs) => txs.filter(t => t.status === client_1.TransactionStatus.SUCCESS);
        const revenue = (txs) => success(txs).reduce((s, t) => s + Number(t.amount), 0);
        const currRevenue = revenue(current);
        const prevRevenue = revenue(previous);
        const revenueChange = prevRevenue === 0 ? 100 : ((currRevenue - prevRevenue) / prevRevenue) * 100;
        const currSuccess = success(current).length;
        const prevSuccess = success(previous).length;
        const successRate = current.length === 0 ? 0 : (currSuccess / current.length) * 100;
        const prevSuccessRate = previous.length === 0 ? 0 : (prevSuccess / previous.length) * 100;
        const activeCustomers = new Set(success(current).map(t => t.customerEmail)).size;
        const prevActiveCustomers = new Set(success(previous).map(t => t.customerEmail)).size;
        return {
            revenue: { value: currRevenue, change: revenueChange },
            transactions: { value: current.length, change: previous.length === 0 ? 100 : ((current.length - previous.length) / previous.length) * 100 },
            successRate: { value: successRate, change: successRate - prevSuccessRate },
            activeCustomers: { value: activeCustomers, change: prevActiveCustomers === 0 ? 100 : ((activeCustomers - prevActiveCustomers) / prevActiveCustomers) * 100 },
        };
    }
    async getRevenueChart(orgId, days = 30) {
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const txs = await this.prisma.transaction.findMany({
            where: { organizationId: orgId, status: client_1.TransactionStatus.SUCCESS, createdAt: { gte: from } },
            orderBy: { createdAt: 'asc' },
        });
        const grouped = {};
        txs.forEach(tx => {
            const day = tx.createdAt.toISOString().split('T')[0];
            grouped[day] = (grouped[day] ?? 0) + Number(tx.amount);
        });
        return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
    }
    async getGatewayBreakdown(orgId, days = 30) {
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const gateways = await this.prisma.gateway.findMany({
            where: { organizationId: orgId },
            include: {
                transactions: {
                    where: { status: client_1.TransactionStatus.SUCCESS, createdAt: { gte: from } },
                },
            },
        });
        return gateways.map(gw => ({
            name: gw.name,
            provider: gw.provider,
            volume: gw.transactions.reduce((s, t) => s + Number(t.amount), 0),
            count: gw.transactions.length,
        }));
    }
    async getKPIs(orgId, days = 30) {
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const txs = await this.prisma.transaction.findMany({
            where: { organizationId: orgId, createdAt: { gte: from } },
        });
        const success = txs.filter(t => t.status === client_1.TransactionStatus.SUCCESS);
        const refunded = txs.filter(t => t.status === client_1.TransactionStatus.REFUNDED);
        const totalRevenue = success.reduce((s, t) => s + Number(t.amount), 0);
        const avgTxValue = success.length === 0 ? 0 : totalRevenue / success.length;
        const refundRate = txs.length === 0 ? 0 : (refunded.length / txs.length) * 100;
        const authRate = txs.length === 0 ? 0 : (success.length / txs.length) * 100;
        return { avgTransactionValue: avgTxValue, refundRate, authorizationRate: authRate };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map