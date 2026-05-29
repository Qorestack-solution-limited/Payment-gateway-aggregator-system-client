"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const api_key_auth_guard_1 = require("../auth/guards/api-key-auth.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const transactions_service_1 = require("./transactions.service");
const transaction_dto_1 = require("./dto/transaction.dto");
const client_1 = require("@prisma/client");
let TransactionsController = class TransactionsController {
    constructor(txs) {
        this.txs = txs;
    }
    async exportCsv(orgId, query, res) {
        const csv = await this.txs.exportCsv(orgId, query);
        res.set('Content-Type', 'text/csv; charset=utf-8');
        res.set('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
        res.send(csv);
    }
    findAll(orgId, query) {
        return this.txs.findAll(orgId, query);
    }
    findByReference(reference, orgId) {
        return this.txs.findByReference(reference, orgId);
    }
    findOne(id, orgId) {
        return this.txs.findOne(id, orgId);
    }
    create(orgId, dto, idempotencyKey) {
        return this.txs.create(orgId, dto, idempotencyKey);
    }
    verify(id, orgId) {
        return this.txs.verify(id, orgId);
    }
    updateStatus(id, orgId, status) {
        return this.txs.updateStatus(id, orgId, status);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)('export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Export transactions as CSV' }),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.QueryTransactionDto, Object]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List transactions with pagination and filters' }),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.QueryTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('reference/:reference'),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Find a transaction by reference' }),
    __param(0, (0, common_1.Param)('reference')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findByReference", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new transaction record' }),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.CreateTransactionDto, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/verify'),
    (0, common_1.UseGuards)(api_key_auth_guard_1.ApiKeyAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Verify transaction status with the selected gateway provider' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "verify", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update transaction status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "updateStatus", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map