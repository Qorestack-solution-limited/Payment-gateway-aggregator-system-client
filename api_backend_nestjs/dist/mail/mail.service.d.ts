import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private transporter;
    private readonly logger;
    constructor(config: ConfigService);
    private send;
    sendWelcome(email: string, firstName: string): Promise<void>;
    sendPaymentNotification(email: string, firstName: string, opts: {
        title: string;
        message: string;
        amount?: string;
        reference?: string;
        status?: string;
        dashboardUrl?: string;
    }): Promise<void>;
    sendGatewayAlert(email: string, firstName: string, gatewayName: string, message: string): Promise<void>;
    sendPasswordReset(email: string, firstName: string, resetUrl: string): Promise<void>;
}
