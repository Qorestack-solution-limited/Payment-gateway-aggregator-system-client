import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
export declare class AnalyticsService {
    private prisma;
    private fx;
    constructor(prisma: PrismaService, fx: ExchangeRatesService);
    private getBaseCurrency;
    private normalizeRevenue;
    getSummary(orgId: string, days?: number): Promise<{
        revenue: {
            value: number;
            change: number;
        };
        transactions: {
            value: number;
            change: number;
        };
        successRate: {
            value: number;
            change: number;
        };
        activeCustomers: {
            value: number;
            change: number;
        };
    }>;
    getRevenueChart(orgId: string, days?: number): Promise<{
        date: string;
        revenue: number;
        currency: string;
    }[]>;
    getGatewayBreakdown(orgId: string, days?: number): Promise<{
        name: string;
        provider: import(".prisma/client").$Enums.GatewayProvider;
        volume: number;
        count: number;
    }[]>;
    getKPIs(orgId: string, days?: number): Promise<{
        avgTransactionValue: number;
        refundRate: number;
        authorizationRate: number;
    }>;
}
