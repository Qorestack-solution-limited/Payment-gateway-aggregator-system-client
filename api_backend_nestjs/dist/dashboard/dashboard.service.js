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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview(orgId) {
        const from30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const from60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const [txsCurrent, txsPrev, gateways, recentTxs] = await Promise.all([
            this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: from30 } } }),
            this.prisma.transaction.findMany({ where: { organizationId: orgId, createdAt: { gte: from60, lt: from30 } } }),
            this.prisma.gateway.findMany({
                where: { organizationId: orgId },
                include: {
                    transactions: {
                        where: { status: client_1.TransactionStatus.SUCCESS, createdAt: { gte: from30 } },
                        select: { amount: true },
                    },
                },
            }),
            this.prisma.transaction.findMany({
                where: { organizationId: orgId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { gateway: { select: { name: true } } },
            }),
        ]);
        const successCurr = txsCurrent.filter(t => t.status === client_1.TransactionStatus.SUCCESS);
        const successPrev = txsPrev.filter(t => t.status === client_1.TransactionStatus.SUCCESS);
        const revenue = successCurr.reduce((s, t) => s + Number(t.amount), 0);
        const prevRevenue = successPrev.reduce((s, t) => s + Number(t.amount), 0);
        const successRate = txsCurrent.length ? (successCurr.length / txsCurrent.length) * 100 : 0;
        const prevSuccessRate = txsPrev.length ? (successPrev.length / txsPrev.length) * 100 : 0;
        const activeCustomers = new Set(successCurr.map(t => t.customerEmail)).size;
        const prevActiveCustomers = new Set(successPrev.map(t => t.customerEmail)).size;
        const pct = (curr, prev) => prev === 0 ? 100 : parseFloat((((curr - prev) / prev) * 100).toFixed(1));
        return {
            stats: {
                revenue: { value: revenue, change: pct(revenue, prevRevenue) },
                transactions: { value: txsCurrent.length, change: pct(txsCurrent.length, txsPrev.length) },
                successRate: { value: parseFloat(successRate.toFixed(1)), change: parseFloat((successRate - prevSuccessRate).toFixed(1)) },
                activeCustomers: { value: activeCustomers, change: pct(activeCustomers, prevActiveCustomers) },
            },
            gatewayPerformance: gateways.map(gw => ({
                id: gw.id,
                name: gw.name,
                provider: gw.provider,
                status: gw.status,
                uptime: gw.uptime,
                volume: gw.transactions.reduce((s, t) => s + Number(t.amount), 0),
                count: gw.transactions.length,
            })),
            recentTransactions: recentTxs,
        };
    }
    async getRevenueChart(orgId) {
        const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map