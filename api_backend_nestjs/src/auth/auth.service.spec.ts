import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn().mockReturnValue('TOTP_SECRET_BASE32'),
    keyuri: jest.fn().mockReturnValue('otpauth://totp/test'),
    verify: jest.fn(),
  },
}));

const { authenticator } = require('otplib');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  organization: { create: jest.fn() },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  passwordReset: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('mock_token'),
};

const mockConfig = {
  get: jest.fn().mockReturnValue('test_value'),
};

const mockMail = {
  sendWelcome: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
};

const mockNotifications = {
  create: jest.fn().mockResolvedValue(undefined),
};

const baseUser = {
  id: 'user1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@test.com',
  password: '',
  role: 'USER',
  twoFactorEnabled: false,
  twoFactorSecret: null,
  organizationId: 'org1',
  organization: { id: 'org1', name: 'Test Org', plan: 'FREE' },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    baseUser.password = await bcrypt.hash('password123', 10);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService,         useValue: mockPrisma },
        { provide: JwtService,            useValue: mockJwt },
        { provide: ConfigService,         useValue: mockConfig },
        { provide: MailService,           useValue: mockMail },
        { provide: NotificationsService,  useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({ email: 'jane@test.com', password: 'password123' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect((result as any).user.password).toBeUndefined();
    });

    it('throws UnauthorizedException on wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);

      await expect(
        service.login({ email: 'jane@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns requiresTwoFactor when 2FA enabled and no code provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...baseUser,
        twoFactorEnabled: true,
        twoFactorSecret: 'TOTP_SECRET',
      });

      const result = await service.login({ email: 'jane@test.com', password: 'password123' });

      expect((result as any).requiresTwoFactor).toBe(true);
    });

    it('throws UnauthorizedException when 2FA code is invalid', async () => {
      authenticator.verify.mockReturnValue(false);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...baseUser,
        twoFactorEnabled: true,
        twoFactorSecret: 'TOTP_SECRET',
      });

      await expect(
        service.login({ email: 'jane@test.com', password: 'password123', totpCode: '000000' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens when 2FA code is valid', async () => {
      authenticator.verify.mockReturnValue(true);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...baseUser,
        twoFactorEnabled: true,
        twoFactorSecret: 'TOTP_SECRET',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'jane@test.com',
        password: 'password123',
        totpCode: '123456',
      });

      expect(result).toHaveProperty('accessToken');
    });
  });

  // ── register ──────────────────────────────────────────────────────────────
  describe('register', () => {
    const dto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@test.com',
      password: 'password123',
      organizationName: 'Test Org',
      plan: 'FREE',
    };

    it('creates user and organization, returns tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.organization.create.mockResolvedValue({ id: 'org1', name: 'Test Org', plan: 'FREE' });
      mockPrisma.user.create.mockResolvedValue({ ...baseUser, organization: { id: 'org1', name: 'Test Org' } });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register(dto);

      expect(result).toHaveProperty('accessToken');
      expect(mockMail.sendWelcome).toHaveBeenCalledWith('jane@test.com', 'Jane');
    });

    it('throws ConflictException when email already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ── 2FA setup ─────────────────────────────────────────────────────────────
  describe('setup2FA', () => {
    it('generates secret and otpauthUrl', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      mockPrisma.user.update.mockResolvedValue(baseUser);

      const result = await service.setup2FA('user1');

      expect(result.secret).toBe('TOTP_SECRET_BASE32');
      expect(result.otpauthUrl).toBe('otpauth://totp/test');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { twoFactorSecret: 'TOTP_SECRET_BASE32' },
      });
    });

    it('throws BadRequestException if 2FA already enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, twoFactorEnabled: true });
      await expect(service.setup2FA('user1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── enable2FA ─────────────────────────────────────────────────────────────
  describe('enable2FA', () => {
    it('enables 2FA when code is valid', async () => {
      authenticator.verify.mockReturnValue(true);
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, twoFactorSecret: 'SECRET' });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.enable2FA('user1', '123456');
      expect(result.message).toContain('enabled');
    });

    it('throws UnauthorizedException when code is invalid', async () => {
      authenticator.verify.mockReturnValue(false);
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, twoFactorSecret: 'SECRET' });

      await expect(service.enable2FA('user1', '000000')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── disable2FA ────────────────────────────────────────────────────────────
  describe('disable2FA', () => {
    it('disables 2FA and clears secret when code is valid', async () => {
      authenticator.verify.mockReturnValue(true);
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, twoFactorEnabled: true, twoFactorSecret: 'SECRET' });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.disable2FA('user1', '123456');
      expect(result.message).toContain('disabled');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { twoFactorEnabled: false, twoFactorSecret: null },
      });
    });

    it('throws BadRequestException when 2FA is not enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(baseUser);
      await expect(service.disable2FA('user1', '123456')).rejects.toThrow(BadRequestException);
    });
  });
});
