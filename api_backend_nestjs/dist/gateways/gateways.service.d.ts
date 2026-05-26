import { PrismaService } from '../prisma/prisma.service';
import { CreateGatewayDto, SyncGatewayTransactionsDto, UpdateGatewayDto } from './dto/gateway.dto';
import { PaymentGatewayRegistry } from '../payments/payment-gateway.registry';
import { WebhooksService } from '../webhooks/webhooks.service';
export declare class GatewaysService {
    private prisma;
    private registry;
    private webhooks;
    constructor(prisma: PrismaService, registry: PaymentGatewayRegistry, webhooks: WebhooksService);
    private assertOwnership;
    private serializeGateway;
    findAll(orgId: string): Promise<any[]>;
    findOne(id: string, orgId: string): Promise<any>;
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
