import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gateway } from '@prisma/client';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ENCRYPTED_PREFIX = 'enc:v1:';

@Injectable()
export class GatewayCredentialsService {
  constructor(private readonly configService: ConfigService) {}

  private getKey() {
    const secret =
      this.configService.get<string>('GATEWAY_ENCRYPTION_KEY') ||
      this.configService.get<string>('JWT_SECRET') ||
      'payorchestra-local-fallback-key';

    return createHash('sha256').update(secret).digest();
  }

  private isEncrypted(value?: string | null) {
    return Boolean(value && value.startsWith(ENCRYPTED_PREFIX));
  }

  encrypt(value?: string | null) {
    if (!value) return value ?? null;
    if (this.isEncrypted(value)) return value;

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${ENCRYPTED_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(value?: string | null) {
    if (!value) return value ?? null;
    if (!this.isEncrypted(value)) return value;

    const payload = value.slice(ENCRYPTED_PREFIX.length);
    const [ivHex, authTagHex, encryptedHex] = payload.split(':');
    if (!ivHex || !authTagHex || !encryptedHex) {
      return value;
    }

    const decipher = createDecipheriv('aes-256-gcm', this.getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  }

  hydrateGateway<T extends Gateway>(gateway: T): T {
    return {
      ...gateway,
      secretKey: this.decrypt(gateway.secretKey),
      webhookSecret: this.decrypt(gateway.webhookSecret),
    };
  }

  prepareCreateData<T extends { secretKey?: string; webhookSecret?: string }>(data: T): T {
    return {
      ...data,
      secretKey: this.encrypt(data.secretKey),
      webhookSecret: this.encrypt(data.webhookSecret),
    };
  }

  prepareUpdateData<T extends { secretKey?: string; webhookSecret?: string }>(data: T): T {
    return {
      ...data,
      ...(Object.prototype.hasOwnProperty.call(data, 'secretKey')
        ? { secretKey: this.encrypt(data.secretKey) }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(data, 'webhookSecret')
        ? { webhookSecret: this.encrypt(data.webhookSecret) }
        : {}),
    };
  }
}
