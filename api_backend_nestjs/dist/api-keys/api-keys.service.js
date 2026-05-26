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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = require("crypto");
let ApiKeysService = class ApiKeysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(orgId) {
        return this.prisma.apiKey.findMany({
            where: { organizationId: orgId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, type: true, isActive: true, lastUsedAt: true, createdAt: true,
                key: true },
        });
    }
    async generate(orgId, name, type) {
        const prefix = type === client_1.ApiKeyType.LIVE ? 'pk_live_' : 'pk_test_';
        const raw = crypto.randomBytes(24).toString('hex');
        const key = `${prefix}${raw}`;
        return this.prisma.apiKey.create({
            data: { name, key, type, organizationId: orgId },
        });
    }
    async revoke(id, orgId) {
        const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
        if (!apiKey)
            throw new common_1.NotFoundException('API key not found');
        if (apiKey.organizationId !== orgId)
            throw new common_1.ForbiddenException();
        return this.prisma.apiKey.update({ where: { id }, data: { isActive: false } });
    }
    async remove(id, orgId) {
        const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
        if (!apiKey)
            throw new common_1.NotFoundException('API key not found');
        if (apiKey.organizationId !== orgId)
            throw new common_1.ForbiddenException();
        await this.prisma.apiKey.delete({ where: { id } });
        return { message: 'API key deleted' };
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map