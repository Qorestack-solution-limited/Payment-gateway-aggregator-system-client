import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyType } from '@prisma/client';
export declare class ApiKeysService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: string): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        type: import(".prisma/client").$Enums.ApiKeyType;
        id: string;
        createdAt: Date;
        key: string;
        isActive: boolean;
        lastUsedAt: Date;
        requestCount: number;
    }[]>;
    generate(orgId: string, name: string, type: ApiKeyType): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.ApiKeyType;
        id: string;
        organizationId: string;
        createdAt: Date;
        key: string;
        isActive: boolean;
        lastUsedAt: Date | null;
        requestCount: number;
    }>;
    revoke(id: string, orgId: string): Promise<{
        name: string;
        type: import(".prisma/client").$Enums.ApiKeyType;
        id: string;
        organizationId: string;
        createdAt: Date;
        key: string;
        isActive: boolean;
        lastUsedAt: Date | null;
        requestCount: number;
    }>;
    remove(id: string, orgId: string): Promise<{
        message: string;
    }>;
}
