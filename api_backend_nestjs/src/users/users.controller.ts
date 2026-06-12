import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@GetUser('id') userId: string) {
    return this.users.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@GetUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.users.updateProfile(userId, dto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(@GetUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(userId, dto);
  }

  @Get('organization/members')
  @ApiOperation({ summary: 'List all members in the current organization' })
  getMembers(@GetUser('organizationId') orgId: string) {
    return this.users.getOrganizationMembers(orgId);
  }

  @Patch('me/organization')
  @ApiOperation({ summary: 'Update organization plan' })
  updateOrganization(
    @GetUser('organizationId') orgId: string,
    @Body('plan') plan: Plan,
  ) {
    return this.users.updateOrganizationPlan(orgId, plan);
  }

  @Patch('me/notification-preferences')
  @ApiOperation({ summary: 'Save notification preferences' })
  updateNotifPrefs(
    @GetUser('id') userId: string,
    @Body() prefs: Record<string, boolean>,
  ) {
    return this.users.updateNotificationPreferences(userId, prefs);
  }

  @Patch('me/organization/profile')
  @ApiOperation({ summary: 'Update organization profile (name, industry, website, size)' })
  updateOrgProfile(
    @GetUser('organizationId') orgId: string,
    @Body() dto: { name?: string; industry?: string; website?: string; companySize?: string },
  ) {
    return this.users.updateOrganizationProfile(orgId, dto);
  }
}
