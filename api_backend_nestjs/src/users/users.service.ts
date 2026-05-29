import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: { organization: true },
    });
    const { password, ...result } = user;
    return result;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password changed successfully' };
  }

  async getOrganizationMembers(orgId: string) {
    if (!orgId) return [];
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

  async updateOrganizationProfile(orgId: string, data: { name?: string; industry?: string; website?: string; companySize?: string }) {
    if (!orgId) throw new ForbiddenException('No organization associated with this account');
    return this.prisma.organization.update({
      where: { id: orgId },
      data,
    });
  }

  async updateOrganizationPlan(orgId: string, plan: Plan) {
    if (!orgId) throw new ForbiddenException('No organization associated with this account');
    const validPlans = Object.values(Plan);
    if (!validPlans.includes(plan)) {
      throw new BadRequestException(`Invalid plan. Must be one of: ${validPlans.join(', ')}`);
    }
    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: { plan },
    });
    return org;
  }
}
