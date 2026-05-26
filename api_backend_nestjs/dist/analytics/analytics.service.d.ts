import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(orgId: string, days?: number): Promise<{
        revenue: {
            value: any;
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
