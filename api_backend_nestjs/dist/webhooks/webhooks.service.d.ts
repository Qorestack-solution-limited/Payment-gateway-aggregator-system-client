import { PrismaService } from '../prisma/prisma.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
export declare class WebhooksService {
    private prisma;
    constructor(prisma: PrismaService);
    private signPayload;
    private wait;
    private assertOwnership;
    findAll(orgId: string): import(".prisma/client").Prisma.PrismaPromise<({
        deliveries: {
            event: string;
            id: string;
            deliveredAt: Date;
            webhookId: string;
            statusCode: number;
            response: string | null;
        }[];
    } & {
        url: string;
        id: string;
        createdAt: Date;
        organizationId: string;
        updatedAt: Date;
        isActive: boolean;
        secret: string;
        events: string[];
    })[]>;
    findOne(id: string, orgId: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        organizationId: string;
        updatedAt: Date;
        isActive: boolean;
        secret: string;
        events: string[];
    }>;
    create(orgId: string, dto: CreateWebhookDto): import(".prisma/client").Prisma.Prisma__WebhookClient<{
        url: string;
        id: string;
        createdAt: Date;
        organizationId: string;
        updatedAt: Date;
        isActive: boolean;
        secret: string;
        events: string[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, orgId: string, dto: UpdateWebhookDto): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        organizationId: string;
        updatedAt: Date;
        isActive: boolean;
        secret: string;
        events: string[];
    }>;
    remove(id: string, orgId: string): Promise<{
        message: string;
    }>;
    getDeliveries(id: string, orgId: string): Promise<{
        event: string;
        id: string;
        deliveredAt: Date;
        webhookId: string;
        statusCode: number;
        response: string | null;
    }[]>;
    dispatchEvent(orgId: string, event: string, data: unknown): Promise<void>;
    private deliverWebhook;
}
