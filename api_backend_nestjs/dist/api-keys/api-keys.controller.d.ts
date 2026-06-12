import { ApiKeyType } from '@prisma/client';
import { ApiKeysService } from './api-keys.service';
declare class GenerateKeyDto {
    name: string;
    type: ApiKeyType;
}
export declare class ApiKeysController {
    private apiKeys;
    constructor(apiKeys: ApiKeysService);
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
    generate(orgId: string, dto: GenerateKeyDto): Promise<{
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
export {};
