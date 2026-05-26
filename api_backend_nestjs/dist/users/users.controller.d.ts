import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    getMe(userId: string): Promise<{
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
    }>;
    updateMe(userId: string, dto: UpdateUserDto): Promise<{
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
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
