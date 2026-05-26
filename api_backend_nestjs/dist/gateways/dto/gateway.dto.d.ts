import { GatewayProvider } from '@prisma/client';
export declare class CreateGatewayDto {
    name: string;
    provider: GatewayProvider;
    type: string;
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
}
export declare class UpdateGatewayDto {
    name?: string;
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
}
export declare class SyncGatewayTransactionsDto {
    from?: string;
    to?: string;
}
