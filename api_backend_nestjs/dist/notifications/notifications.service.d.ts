import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, title: string, message: string, type?: NotificationType): Promise<{
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        message: string;
        isRead: boolean;
        createdAt: Date;
        userId: string;
    }>;
    findAllForUser(userId: string): Promise<{
        notifications: {
            type: import(".prisma/client").$Enums.NotificationType;
            title: string;
            id: string;
            message: string;
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
