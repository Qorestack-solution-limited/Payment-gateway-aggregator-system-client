import { GatewaysService } from './gateways.service';
import { CreateGatewayDto, SyncGatewayTransactionsDto, UpdateGatewayDto } from './dto/gateway.dto';
export declare class GatewaysController {
    private gateways;
    constructor(gateways: GatewaysService);
    findAll(orgId: string): Promise<any[]>;
    getWebhookEvents(id: string, orgId: string): Promise<({
        transaction: {
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            reference: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
        };
    } & {
        event: string;
        id: string;
        organizationId: string | null;
        provider: import(".prisma/client").$Enums.GatewayProvider;
        status: string;
        reference: string | null;
        signature: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        rawBody: string | null;
        errorMessage: string | null;
        gatewayId: string | null;
        transactionId: string | null;
        receivedAt: Date;
    })[]>;
    getSyncRuns(id: string, orgId: string): Promise<{
        id: string;
        organizationId: string;
        message: string | null;
        status: string;
        gatewayId: string;
        imported: number;
        updated: number;
        totalFetched: number;
        fromDate: string | null;
        toDate: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }[]>;
    findOne(id: string, orgId: string): Promise<any>;
    create(orgId: string, dto: CreateGatewayDto): Promise<any>;
    update(id: string, orgId: string, dto: UpdateGatewayDto): Promise<any>;
    toggle(id: string, orgId: string, actorId: string, actorEmail: string): Promise<any>;
    validate(id: string, orgId: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    syncTransactions(id: string, orgId: string, dto: SyncGatewayTransactionsDto): Promise<{
        gatewayId: string;
        imported: number;
        updated: number;
        totalFetched: number;
        message: string;
    }>;
    remove(id: string, orgId: string, actorId: string, actorEmail: string): Promise<{
        message: string;
    }>;
}
