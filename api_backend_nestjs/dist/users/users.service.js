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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password, ...result } = user;
        return result;
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: dto,
            include: { organization: true },
        });
        const { password, ...result } = user;
        return result;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const valid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!valid)
            throw new common_1.BadRequestException('Current password is incorrect');
        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
        return { message: 'Password changed successfully' };
    }
    async getOrganizationMembers(orgId) {
        if (!orgId)
            return [];
        return this.prisma.user.findMany({
            where: { organizationId: orgId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async updateNotificationPreferences(userId, prefs) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { notificationPreferences: prefs },
        });
        return { message: 'Notification preferences saved' };
    }
    async updateOrganizationProfile(orgId, data) {
        if (!orgId)
            throw new common_1.ForbiddenException('No organization associated with this account');
        return this.prisma.organization.update({
            where: { id: orgId },
            data,
        });
    }
    async updateOrganizationPlan(orgId, plan) {
        if (!orgId)
            throw new common_1.ForbiddenException('No organization associated with this account');
        const validPlans = Object.values(client_1.Plan);
        if (!validPlans.includes(plan)) {
            throw new common_1.BadRequestException(`Invalid plan. Must be one of: ${validPlans.join(', ')}`);
        }
        const org = await this.prisma.organization.update({
            where: { id: orgId },
            data: { plan },
        });
        return org;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map