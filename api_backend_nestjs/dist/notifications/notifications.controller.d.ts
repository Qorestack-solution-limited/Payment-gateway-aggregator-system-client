import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notifications;
    constructor(notifications: NotificationsService);
    findAll(userId: string): Promise<{
        notifications: {
            id: string;
            title: string;
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            isRead: boolean;
            createdAt: Date;
            userId: string;
        }[];
        unreadCount: number;
    }>;
    markRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
