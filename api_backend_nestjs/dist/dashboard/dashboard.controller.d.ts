import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboard;
    constructor(dashboard: DashboardService);
    overview(orgId: string): Promise<{
        stats: {
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
        };
        gatewayPerformance: {
            id: string;
            name: string;
            provider: import(".prisma/client").$Enums.GatewayProvider;
            status: import(".prisma/client").$Enums.GatewayStatus;
            uptime: number;
            volume: number;
            count: number;
        }[];
        recentTransactions: ({
            gateway: {
                name: string;
            };
        } & {
            description: string | null;
            id: string;
            createdAt: Date;
            organizationId: string;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.TransactionStatus;
            lastSyncedAt: Date | null;
            reference: string;
            providerReference: string | null;
            providerStatus: string | null;
            providerTransactionId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            customerName: string;
            customerEmail: string;
            gatewayId: string;
            providerPayload: import("@prisma/client/runtime/library").JsonValue | null;
            syncedFromProvider: boolean;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    }>;
    revenueChart(orgId: string): Promise<{
        date: string;
        revenue: number;
    }[]>;
}
