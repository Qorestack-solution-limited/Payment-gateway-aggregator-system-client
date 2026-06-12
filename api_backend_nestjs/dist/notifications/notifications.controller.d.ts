import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notifications;
    constructor(notifications: NotificationsService);
    findAll(userId: string): Promise<{
        notifications: {
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            id: string;
            createdAt: Date;
            message: string;
            isRead: boolean;
            userId: string;
        }[];
        unreadCount: number;
    }>;
    markRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
