import { Plan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
    }>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<{
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
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getOrganizationMembers(orgId: string): Promise<{
        firstName: string;
        lastName: string;
        email: string;
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    updateOrganizationProfile(orgId: string, data: {
        name?: string;
        industry?: string;
        website?: string;
        companySize?: string;
    }): Promise<{
        name: string;
        companySize: string | null;
        industry: string | null;
        website: string | null;
        plan: import(".prisma/client").$Enums.Plan;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateOrganizationPlan(orgId: string, plan: Plan): Promise<{
        name: string;
        companySize: string | null;
        industry: string | null;
        website: string | null;
        plan: import(".prisma/client").$Enums.Plan;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
