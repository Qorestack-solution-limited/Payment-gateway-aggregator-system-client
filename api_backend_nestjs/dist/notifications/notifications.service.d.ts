import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
export declare class NotificationsService {
    private prisma;
    private mail;
    constructor(prisma: PrismaService, mail: MailService);
    create(userId: string, title: string, message: string, type?: NotificationType, opts?: {
        skipEmail?: boolean;
    }): Promise<any>;
    findAllForUser(userId: string): Promise<{
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
