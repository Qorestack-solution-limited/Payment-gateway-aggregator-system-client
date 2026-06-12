import { TransactionStatus } from '@prisma/client';
export declare class CreateTransactionDto {
    amount: number;
    currency?: string;
    customerName: string;
    customerEmail: string;
    gatewayId?: string;
    description?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
}
export declare class QueryTransactionDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: TransactionStatus;
    gatewayId?: string;
    provider?: string;
    from?: string;
    to?: string;
}
