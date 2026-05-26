import { GatewaysService } from './gateways.service';
import { CreateGatewayDto, SyncGatewayTransactionsDto, UpdateGatewayDto } from './dto/gateway.dto';
export declare class GatewaysController {
    private gateways;
    constructor(gateways: GatewaysService);
    findAll(orgId: string): Promise<any[]>;
    findOne(id: string, orgId: string): Promise<any>;
    create(orgId: string, dto: CreateGatewayDto): Promise<any>;
    update(id: string, orgId: string, dto: UpdateGatewayDto): Promise<any>;
    toggle(id: string, orgId: string): Promise<any>;
    validate(id: string, orgId: string): Promise<{
        ok: boolean;
        message: string;
    }>;
    syncTransactions(id: string, orgId: string, dto: SyncGatewayTransactionsDto): Promise<{
        gatewayId: string;
        imported: number;
        updated: number;
        totalFetched: number;
        message: string;
    }>;
    remove(id: string, orgId: string): Promise<{
        message: string;
    }>;
}
