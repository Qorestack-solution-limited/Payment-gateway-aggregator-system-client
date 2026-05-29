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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const otplib_1 = require("otplib");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config, mail, notificationsService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.mail = mail;
        this.notificationsService = notificationsService;
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const planMap = {
            free: client_1.Plan.FREE,
            starter: client_1.Plan.STARTER,
            pro: client_1.Plan.PRO,
            enterprise: client_1.Plan.ENTERPRISE,
        };
        const organization = await this.prisma.organization.create({
            data: {
                name: dto.organizationName,
                companySize: dto.companySize,
                industry: dto.industry,
                website: dto.website,
                plan: planMap[dto.plan?.toLowerCase()] ?? client_1.Plan.FREE,
            },
        });
        const hashed = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                password: hashed,
                organizationId: organization.id,
            },
            include: { organization: true },
        });
        await this.mail.sendWelcome(user.email, user.firstName);
        await this.notificationsService.create(user.id, 'Welcome to PayOrchestra!', `Hi ${user.firstName}, your account is ready. Connect your first gateway to start processing payments.`, client_1.NotificationType.SUCCESS);
        const tokens = await this.generateTokens(user.id, user.email);
        const { password, ...userOut } = user;
        return { ...tokens, user: userOut };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { organization: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Incorrect email or password');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Incorrect email or password');
        if (user.twoFactorEnabled) {
            if (!dto.totpCode) {
                return { requiresTwoFactor: true };
            }
            const codeValid = otplib_1.authenticator.verify({ token: dto.totpCode, secret: user.twoFactorSecret });
            if (!codeValid)
                throw new common_1.UnauthorizedException('Invalid authenticator code');
        }
        const tokens = await this.generateTokens(user.id, user.email);
        const { password, twoFactorSecret, ...userOut } = user;
        return { ...tokens, user: userOut };
    }
    async setup2FA(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.twoFactorEnabled)
            throw new common_1.BadRequestException('2FA is already enabled');
        const secret = otplib_1.authenticator.generateSecret();
        const otpauthUrl = otplib_1.authenticator.keyuri(user.email, 'PayOrchestra', secret);
        await this.prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
        return { secret, otpauthUrl };
    }
    async enable2FA(userId, totpCode) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.twoFactorSecret)
            throw new common_1.BadRequestException('Run 2FA setup first');
        if (user.twoFactorEnabled)
            throw new common_1.BadRequestException('2FA is already enabled');
        const valid = otplib_1.authenticator.verify({ token: totpCode, secret: user.twoFactorSecret });
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid authenticator code');
        await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
        return { message: '2FA enabled successfully' };
    }
    async disable2FA(userId, totpCode) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.twoFactorEnabled)
            throw new common_1.BadRequestException('2FA is not enabled');
        const valid = otplib_1.authenticator.verify({ token: totpCode, secret: user.twoFactorSecret });
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid authenticator code');
        await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
        return { message: '2FA disabled successfully' };
    }
    async refreshToken(token) {
        const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
        if (!stored || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token invalid or expired');
        }
        await this.prisma.refreshToken.delete({ where: { token } });
        const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return this.generateTokens(user.id, user.email);
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            return { message: 'If that email exists, a reset link has been sent.' };
        await this.prisma.passwordReset.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.passwordReset.create({
            data: { token, userId: user.id, expiresAt },
        });
        const resetUrl = `${this.config.get('CLIENT_URL')}/reset-password?token=${token}`;
        await this.mail.sendPasswordReset(user.email, user.firstName, resetUrl);
        return { message: 'If that email exists, a reset link has been sent.' };
    }
    async resetPassword(dto) {
        const record = await this.prisma.passwordReset.findUnique({
            where: { token: dto.token },
            include: { user: true },
        });
        if (!record || record.used || record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Reset token is invalid or has expired');
        }
        const hashed = await bcrypt.hash(dto.password, 12);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: record.userId },
                data: { password: hashed },
            }),
            this.prisma.passwordReset.update({
                where: { token: dto.token },
                data: { used: true },
            }),
            this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
        ]);
        return { message: 'Password reset successfully' };
    }
    async generateTokens(userId, email) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync({ sub: userId, email }, { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m' }),
            this.jwt.signAsync({ sub: userId, email }, { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d' }),
        ]);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map