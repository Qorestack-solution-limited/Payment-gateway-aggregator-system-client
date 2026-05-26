import { PrismaService } from '../prisma/prisma.service';
import { ApiKeyType } from '@prisma/client';
export declare class ApiKeysService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: string): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        type: import(".prisma/client").$Enums.ApiKeyType;
        createdAt: Date;
        key: string;
        isActive: boolean;
        lastUsedAt: Date;
    }[]>;
    generate(orgId: string, name: string, type: ApiKeyType): Promise<{
        name: string;
        id: string;
        type: import(".prisma/client").$Enums.ApiKeyType;
        createdAt: Date;
        organizationId: string;
        key: string;
        isActive: boolean;
        lastUsedAt: Date | null;
    }>;
    revoke(id: string, orgId: string): Promise<{
        name: string;
        id: string;
        type: import(".prisma/client").$Enums.ApiKeyType;
        createdAt: Date;
        organizationId: string;
        key: string;
        isActive: boolean;
        lastUsedAt: Date | null;
    }>;
    remove(id: string, orgId: string): Promise<{
        message: string;
    }>;
}
