import { AuditService } from '../audit/audit.service';
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
    private audit;
    constructor(prisma: PrismaService, registry: PaymentGatewayRegistry, credentials: GatewayCredentialsService, webhooks: WebhooksService, audit: AuditService);
    private assertOwnership;
    private serializeGateway;
    findAll(orgId: string): Promise<any[]>;
    findOne(id: string, orgId: string): Promise<any>;
    getWebhookEvents(id: string, orgId: string): Promise<({
        transaction: {
            id: string;
            reference: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
        };
    } & {
        event: string;
        id: string;
        organizationId: string | null;
        reference: string | null;
        status: string;
        gatewayId: string | null;
        provider: import(".prisma/client").$Enums.GatewayProvider;
        transactionId: string | null;
        signature: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        rawBody: string | null;
        errorMessage: string | null;
        receivedAt: Date;
    })[]>;
    getSyncRuns(id: string, orgId: string): Promise<{
        id: string;
        organizationId: string;
        status: string;
        gatewayId: string;
        imported: number;
        updated: number;
        totalFetched: number;
        message: string | null;
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
    toggleStatus(id: string, orgId: string, actorId?: string, actorEmail?: string): Promise<any>;
    remove(id: string, orgId: string, actorId?: string, actorEmail?: string): Promise<{
        message: string;
    }>;
}
