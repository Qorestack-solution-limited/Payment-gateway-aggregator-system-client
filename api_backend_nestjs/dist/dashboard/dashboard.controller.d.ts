import { DashboardService } from './dashboard.service';
import { EventsBusService } from '../events/events-bus.service';
import { Request, Response } from 'express';
export declare class DashboardController {
    private dashboard;
    private events;
    constructor(dashboard: DashboardService, events: EventsBusService);
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
            organizationId: string;
            createdAt: Date;
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
            refundId: string | null;
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
    sseEvents(orgId: string, req: Request, res: Response): void;
}
