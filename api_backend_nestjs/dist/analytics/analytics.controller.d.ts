import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analytics;
    constructor(analytics: AnalyticsService);
    summary(orgId: string, days?: string): Promise<{
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
    revenueChart(orgId: string, days?: string): Promise<{
        date: string;
        revenue: number;
        currency: string;
    }[]>;
    gatewayBreakdown(orgId: string, days?: string): Promise<{
        name: string;
        provider: import(".prisma/client").$Enums.GatewayProvider;
        volume: number;
        count: number;
    }[]>;
    kpis(orgId: string, days?: string): Promise<{
        avgTransactionValue: number;
        refundRate: number;
        authorizationRate: number;
    }>;
}
