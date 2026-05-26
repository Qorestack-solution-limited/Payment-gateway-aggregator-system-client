import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    private mail;
    private notificationsService;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, mail: MailService, notificationsService: NotificationsService);
    register(dto: RegisterDto): Promise<{
        user: {
            organization: {
                name: string;
                companySize: string | null;
                industry: string | null;
                website: string | null;
                plan: import(".prisma/client").$Enums.Plan;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
            firstName: string;
            lastName: string;
            email: string;
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
            organizationId: string | null;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            organization: {
                name: string;
                companySize: string | null;
                industry: string | null;
                website: string | null;
                plan: import(".prisma/client").$Enums.Plan;
                id: string;
                createdAt: Date;
                updatedAt: Date;
            };
            firstName: string;
            lastName: string;
            email: string;
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
            organizationId: string | null;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private generateTokens;
}
