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
    } catch (err: any) {
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

  async sendPaymentNotification(email: string, firstName: string, opts: {
    title: string;
    message: string;
    amount?: string;
    reference?: string;
    status?: string;
    dashboardUrl?: string;
  }) {
    const clientUrl = this.config.get('CLIENT_URL') || 'http://localhost:5173';
    const statusColor: Record<string, string> = {
      SUCCESS: '#16a34a', FAILED: '#dc2626', PENDING: '#d97706', REFUNDED: '#2563eb',
    };
    const color = opts.status ? (statusColor[opts.status] ?? '#1A1A1A') : '#1A1A1A';
    await this.send(
      email,
      opts.title,
      `<div style="font-family:sans-serif;max-width:560px;margin:auto">
        <div style="background:#1a5c35;padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#C5E63D;margin:0;font-size:24px">PayOrchestra</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#1A1A1A">Hi ${firstName},</h2>
          <p style="color:#6b7280">${opts.message}</p>
          ${opts.amount ? `<p style="font-size:24px;font-weight:bold;color:${color}">${opts.amount}</p>` : ''}
          ${opts.reference ? `<p style="color:#9ca3af;font-size:12px">Reference: <code>${opts.reference}</code></p>` : ''}
          <a href="${opts.dashboardUrl || clientUrl + '/transactions'}"
             style="display:inline-block;background:#1A1A1A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px">
            View on Dashboard
          </a>
        </div>
      </div>`,
    );
  }

  async sendGatewayAlert(email: string, firstName: string, gatewayName: string, message: string) {
    const clientUrl = this.config.get('CLIENT_URL') || 'http://localhost:5173';
    await this.send(
      email,
      `Gateway Alert: ${gatewayName}`,
      `<div style="font-family:sans-serif;max-width:560px;margin:auto">
        <div style="background:#1a5c35;padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#C5E63D;margin:0;font-size:24px">PayOrchestra</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
          <h2 style="color:#1A1A1A">Hi ${firstName},</h2>
          <p style="color:#6b7280">There is an alert for your gateway <strong>${gatewayName}</strong>:</p>
          <p style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px;color:#c2410c">${message}</p>
          <a href="${clientUrl}/gateways"
             style="display:inline-block;background:#1A1A1A;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px">
            View Gateways
          </a>
        </div>
      </div>`,
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
