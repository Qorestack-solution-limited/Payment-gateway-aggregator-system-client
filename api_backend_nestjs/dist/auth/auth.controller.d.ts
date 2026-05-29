import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
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
            twoFactorSecret: string | null;
            twoFactorEnabled: boolean;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        requiresTwoFactor: boolean;
    } | {
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
            twoFactorEnabled: boolean;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
        requiresTwoFactor?: undefined;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    setup2FA(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    enable2FA(userId: string, totpCode: string): Promise<{
        message: string;
    }>;
    disable2FA(userId: string, totpCode: string): Promise<{
        message: string;
    }>;
}
