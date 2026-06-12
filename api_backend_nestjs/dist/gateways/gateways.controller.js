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
exports.GatewaysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
const gateways_service_1 = require("./gateways.service");
const gateway_dto_1 = require("./dto/gateway.dto");
let GatewaysController = class GatewaysController {
    constructor(gateways) {
        this.gateways = gateways;
    }
    findAll(orgId) {
        return this.gateways.findAll(orgId);
    }
    getWebhookEvents(id, orgId) {
        return this.gateways.getWebhookEvents(id, orgId);
    }
    getSyncRuns(id, orgId) {
        return this.gateways.getSyncRuns(id, orgId);
    }
    findOne(id, orgId) {
        return this.gateways.findOne(id, orgId);
    }
    create(orgId, dto) {
        return this.gateways.create(orgId, dto);
    }
    update(id, orgId, dto) {
        return this.gateways.update(id, orgId, dto);
    }
    toggle(id, orgId, actorId, actorEmail) {
        return this.gateways.toggleStatus(id, orgId, actorId, actorEmail);
    }
    validate(id, orgId) {
        return this.gateways.validate(id, orgId);
    }
    syncTransactions(id, orgId, dto) {
        return this.gateways.syncTransactions(id, orgId, dto);
    }
    remove(id, orgId, actorId, actorEmail) {
        return this.gateways.remove(id, orgId, actorId, actorEmail);
    }
};
exports.GatewaysController = GatewaysController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all gateways for the organisation' }),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/webhook-events'),
    (0, swagger_1.ApiOperation)({ summary: 'List recent inbound provider webhook events for a gateway' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "getWebhookEvents", null);
__decorate([
    (0, common_1.Get)(':id/sync-runs'),
    (0, swagger_1.ApiOperation)({ summary: 'List recent transaction sync runs for a gateway' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "getSyncRuns", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Connect a new payment gateway' }),
    __param(0, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, gateway_dto_1.CreateGatewayDto]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, gateway_dto_1.UpdateGatewayDto]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle gateway active/inactive' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __param(3, (0, get_user_decorator_1.GetUser)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)(':id/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate gateway credentials/configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)(':id/sync-transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Pull transactions from the selected gateway into the unified store' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, gateway_dto_1.SyncGatewayTransactionsDto]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "syncTransactions", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)('organizationId')),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __param(3, (0, get_user_decorator_1.GetUser)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], GatewaysController.prototype, "remove", null);
exports.GatewaysController = GatewaysController = __decorate([
    (0, swagger_1.ApiTags)('Gateways'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('gateways'),
    __metadata("design:paramtypes", [gateways_service_1.GatewaysService])
], GatewaysController);
//# sourceMappingURL=gateways.controller.js.map