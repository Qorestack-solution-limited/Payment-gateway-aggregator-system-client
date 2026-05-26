import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private transporter;
    private readonly logger;
    constructor(config: ConfigService);
    private send;
    sendWelcome(email: string, firstName: string): Promise<void>;
    sendPasswordReset(email: string, firstName: string, resetUrl: string): Promise<void>;
}
