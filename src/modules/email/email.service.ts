import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService implements OnModuleInit {
    private resend: Resend;
    private readonly logger = new Logger(EmailService.name);
    private apiKey: string;
    private fromEmail: string;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        this.apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
        this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'onboarding@resend.dev');

        if (this.apiKey) {
            this.resend = new Resend(this.apiKey);
            this.logger.log('✅ Email Service initialized with Resend');
        } else {
            this.logger.warn('⚠️  RESEND_API_KEY not found. Email Service is in DEV MODE (logging to console).');
        }
    }

    async sendEmail(to: string, subject: string, html: string) {
        if (!this.apiKey) {
            this.logger.log(`
      ================ [DEV MODE] EMAIL SENT ================
      To: ${to}
      Subject: ${subject}
      -------------------------------------------------------
      ${html}
      =======================================================
      `);
            return { id: 'dev_mock_id' };
        }

        try {
            const data = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${data.data?.id}`);
            return data;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error);
            throw error;
        }
    }
}
