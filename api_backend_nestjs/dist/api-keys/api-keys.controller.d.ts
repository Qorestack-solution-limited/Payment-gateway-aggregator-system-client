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
        id: string;
        type: import(".prisma/client").$Enums.ApiKeyType;
        createdAt: Date;
        key: string;
        isActive: boolean;
        lastUsedAt: Date;
    }[]>;
    generate(orgId: string, dto: GenerateKeyDto): Promise<{
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
export {};
