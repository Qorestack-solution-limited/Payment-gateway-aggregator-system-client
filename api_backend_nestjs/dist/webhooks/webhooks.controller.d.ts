import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
export declare class WebhooksController {
    private webhooks;
    constructor(webhooks: WebhooksService);
    findAll(orgId: string): import(".prisma/client").Prisma.PrismaPromise<({
        deliveries: {
            event: string;
            id: string;
            deliveredAt: Date;
            webhookId: string;
            statusCode: number;
            response: string | null;
            retryCount: number;
            nextRetryAt: Date | null;
        }[];
    } & {
        id: string;
        url: string;
        events: string[];
        isActive: boolean;
        secret: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string, orgId: string): Promise<{
        id: string;
        url: string;
        events: string[];
        isActive: boolean;
        secret: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(orgId: string, dto: CreateWebhookDto): import(".prisma/client").Prisma.Prisma__WebhookClient<{
        id: string;
        url: string;
        events: string[];
        isActive: boolean;
        secret: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, orgId: string, dto: UpdateWebhookDto): Promise<{
        id: string;
        url: string;
        events: string[];
        isActive: boolean;
        secret: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, orgId: string): Promise<{
        message: string;
    }>;
    deliveries(id: string, orgId: string): Promise<{
        event: string;
        id: string;
        deliveredAt: Date;
        webhookId: string;
        statusCode: number;
        response: string | null;
        retryCount: number;
        nextRetryAt: Date | null;
    }[]>;
    sendTest(id: string, orgId: string): Promise<{
        event: string;
        id: string;
        deliveredAt: Date;
        webhookId: string;
        statusCode: number;
        response: string | null;
        retryCount: number;
        nextRetryAt: Date | null;
    }>;
    retryDelivery(deliveryId: string, orgId: string): Promise<{
        event: string;
        id: string;
        deliveredAt: Date;
        webhookId: string;
        statusCode: number;
        response: string | null;
        retryCount: number;
        nextRetryAt: Date | null;
    }>;
}
