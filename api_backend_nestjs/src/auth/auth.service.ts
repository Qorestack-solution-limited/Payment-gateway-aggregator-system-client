import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationType, Plan } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const planMap: Record<string, Plan> = {
      free: Plan.FREE,
      starter: Plan.STARTER,
      pro: Plan.PRO,
      enterprise: Plan.ENTERPRISE,
    };

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.organizationName,
        companySize: dto.companySize,
        industry: dto.industry,
        website: dto.website,
        plan: planMap[dto.plan?.toLowerCase()] ?? Plan.FREE,
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

    await this.notificationsService.create(
      user.id,
      'Welcome to PayOrchestra!',
      `Hi ${user.firstName}, your account is ready. Connect your first gateway to start processing payments.`,
      NotificationType.SUCCESS,
    );

    const tokens = await this.generateTokens(user.id, user.email);
    const { password, ...userOut } = user;
    return { ...tokens, user: userOut };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { organization: true },
    });
    if (!user) throw new UnauthorizedException('Incorrect email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Incorrect email or password');

    const tokens = await this.generateTokens(user.id, user.email);
    const { password, ...userOut } = user;
    return { ...tokens, user: userOut };
  }

  async refreshToken(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    await this.prisma.refreshToken.delete({ where: { token } });
    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw new UnauthorizedException('User not found');

    return this.generateTokens(user.id, user.email);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Always return success to not reveal whether the email exists
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    // Invalidate old tokens
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    const resetUrl = `${this.config.get('CLIENT_URL')}/reset-password?token=${token}`;
    await this.mail.sendPasswordReset(user.email, user.firstName, resetUrl);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('Reset token is invalid or has expired');
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
      // Invalidate all refresh tokens on password change
      this.prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { message: 'Password reset successfully' };
  }

  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email },
        { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m' },
      ),
      this.jwt.signAsync(
        { sub: userId, email },
        { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d' },
      ),
    ]);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });

    return { accessToken, refreshToken };
  }
}
