import { PrismaService } from '../prisma/prisma.service';
import { CreateGatewayDto, SyncGatewayTransactionsDto, UpdateGatewayDto } from './dto/gateway.dto';
import { PaymentGatewayRegistry } from '../payments/payment-gateway.registry';
import { GatewayCredentialsService } from '../payments/gateway-credentials.service';
import { WebhooksService } from '../webhooks/webhooks.service';
export declare class GatewaysService {
    private prisma;
    private registry;
    private credentials;
    private webhooks;
    constructor(prisma: PrismaService, registry: PaymentGatewayRegistry, credentials: GatewayCredentialsService, webhooks: WebhooksService);
    private assertOwnership;
    private serializeGateway;
    findAll(orgId: string): Promise<any[]>;
    findOne(id: string, orgId: string): Promise<any>;
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
        message: string | null;
        organizationId: string;
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
    create(orgId: string, dto: CreateGatewayDto): Promise<any>;
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
    update(id: string, orgId: string, dto: UpdateGatewayDto): Promise<any>;
    toggleStatus(id: string, orgId: string): Promise<any>;
    remove(id: string, orgId: string): Promise<{
        message: string;
    }>;
}
