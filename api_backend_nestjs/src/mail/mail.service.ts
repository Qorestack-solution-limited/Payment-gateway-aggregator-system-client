import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST'),
      port: config.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
    });
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM') || 'PayOrchestra <noreply@payorchestra.com>',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendWelcome(email: string, firstName: string) {
    await this.send(
      email,
      'Welcome to PayOrchestra!',
      `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <div style="background:#1a5c35;padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#C5E63D;margin:0;font-size:24px">PayOrchestra</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#1A1A1A">Welcome, ${firstName}! 🎉</h2>
          <p style="color:#6b7280">Your account has been created. Start connecting your payment gateways from your dashboard.</p>
          <a href="${this.config.get('CLIENT_URL')}/dashboard"
             style="display:inline-block;background:#1A1A1A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px">
            Go to Dashboard
          </a>
        </div>
      </div>
      `,
    );
  }

  async sendPasswordReset(email: string, firstName: string, resetUrl: string) {
    await this.send(
      email,
      'Reset your PayOrchestra password',
      `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <div style="background:#1a5c35;padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#C5E63D;margin:0;font-size:24px">PayOrchestra</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#1A1A1A">Hi ${firstName},</h2>
          <p style="color:#6b7280">We received a request to reset your password. Click the button below. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#1A1A1A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px">
            Reset Password
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
      `,
    );
  }
}
