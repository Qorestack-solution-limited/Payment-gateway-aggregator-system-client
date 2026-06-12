import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(config: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<{
        organization: {
            name: string;
            companySize: string | null;
            industry: string | null;
            website: string | null;
            plan: import(".prisma/client").$Enums.Plan;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            baseCurrency: string;
        };
        firstName: string;
        lastName: string;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
        organizationId: string | null;
        twoFactorSecret: string | null;
        twoFactorEnabled: boolean;
        notificationPreferences: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
