import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('API key is required');
    }

    const key = authHeader.slice('Bearer '.length).trim();
    if (!key) {
      throw new UnauthorizedException('API key is required');
    }

    try {
      const payload = await this.jwt.verifyAsync(key, {
        secret: this.config.get('JWT_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { organization: true },
      });

      if (user) {
        const { password, ...result } = user;
        request.user = { ...result, authType: 'jwt' };
        return true;
      }
    } catch {
      // Fall through to API key lookup.
    }

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key },
    });

    if (!apiKey || !apiKey.isActive) {
      throw new UnauthorizedException('Authorization token is invalid or revoked');
    }

    request.user = {
      organizationId: apiKey.organizationId,
      apiKeyId: apiKey.id,
      authType: 'apiKey',
    };

    // Update lastUsedAt and increment requestCount (fire-and-forget)
    this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
    }).catch(() => {});

    return true;
  }
}
