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
exports.ApiKeyAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
let ApiKeyAuthGuard = class ApiKeyAuthGuard {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('API key is required');
        }
        const key = authHeader.slice('Bearer '.length).trim();
        if (!key) {
            throw new common_1.UnauthorizedException('API key is required');
        }
        try {
            const payload = await this.jwt.verifyAsync(key, {
                secret: this.config.get('JWT_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { organization: true },
            });
            if (user) {
                const { password, ...result } = user;
                request.user = { ...result, authType: 'jwt' };
                return true;
            }
        }
        catch {
        }
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { key },
        });
        if (!apiKey || !apiKey.isActive) {
            throw new common_1.UnauthorizedException('Authorization token is invalid or revoked');
        }
        request.user = {
            organizationId: apiKey.organizationId,
            apiKeyId: apiKey.id,
            authType: 'apiKey',
        };
        await this.prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
        });
        return true;
    }
};
exports.ApiKeyAuthGuard = ApiKeyAuthGuard;
exports.ApiKeyAuthGuard = ApiKeyAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], ApiKeyAuthGuard);
//# sourceMappingURL=api-key-auth.guard.js.map