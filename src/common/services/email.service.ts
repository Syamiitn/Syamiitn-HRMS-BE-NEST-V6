import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private driver: string;
  private sendgridReady = false;

  constructor(private readonly config: ConfigService) {
    this.driver = this.config.get<string>('mail.driver', 'console');
    if (this.driver === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('mail.host'),
        port: this.config.get<number>('mail.port'),
        secure: this.config.get<boolean>('mail.secure'),
        auth: {
          user: this.config.get<string>('mail.user'),
          pass: this.config.get<string>('mail.pass'),
        },
      });
    } else if (this.driver === 'sendgrid') {
      const key = this.config.get<string>('mail.sendgridApiKey');
      if (!key) {
        this.logger.error('SENDGRID_API_KEY not configured; emails will not be sent');
      } else {
        try {
          sgMail.setApiKey(key);
          this.sendgridReady = true;
        } catch (e) {
          this.logger.error('Failed to init SendGrid', e as any);
        }
      }
    }
  }

  async sendOtp(to: string, code: string): Promise<void> {
    const from = this.config.get<string>('mail.from');
    const subject = 'Your verification code';
    const text = `Your verification code is: ${code}`;
    const html = `<p>Your verification code is: <b>${code}</b></p>`;

    // Console driver
    if (this.driver === 'console') {
      this.logger.log(`[MAIL:console] To=${to} Subject="${subject}" Body=${text}`);
      return;
    }

    // SendGrid driver
    if (this.driver === 'sendgrid') {
      if (!this.sendgridReady) {
        this.logger.error('SendGrid not initialized; cannot send email');
        return;
      }
      await sgMail.send({ to, from, subject, text, html } as any);
      return;
    }

    // SMTP driver via nodemailer
    if (!this.transporter) {
      this.logger.error('SMTP transporter not initialized; cannot send email');
      return;
    }
    
    await this.transporter.sendMail({ from, to, subject, text, html });
    this.logger.log(`[MAIL:smtp] To=${to} Subject="${subject}" Body=${text}`);
    
  }

  async sendPasswordReset(to: string, link: string): Promise<void> {
    const from = this.config.get<string>('mail.from');
    const subject = 'Password reset request';
    const text = `Click the link to reset your password: ${link}`;
    const html = `<p>Click the link to reset your password:</p><p><a href="${link}">${link}</a></p>`;

    if (this.driver === 'console') {
      this.logger.log(`[MAIL:console] To=${to} Subject="${subject}" Link=${link}`);
      return;
    }

    if (this.driver === 'sendgrid') {
      if (!this.sendgridReady) {
        this.logger.error('SendGrid not initialized; cannot send email');
        return;
      }
      await sgMail.send({ to, from, subject, text, html } as any);
      return;
    }

    if (!this.transporter) {
      this.logger.error('SMTP transporter not initialized; cannot send email');
      return;
    }
    await this.transporter.sendMail({ from, to, subject, text, html });
    this.logger.log(`[MAIL:smtp] To=${to} Subject="${subject}" Link=${link}`);
    
  }

  async sendPasswordResetSuccess(to: string): Promise<void> {
    const from = this.config.get<string>('mail.from');
    const subject = 'Your password was reset';
    const text = 'Your password has been reset successfully. If you did not request this change, please contact support immediately.';
    const html = `<p>Your password has been reset successfully.</p><p>If you did not request this change, please contact support immediately.</p>`;

    if (this.driver === 'console') {
      this.logger.log(`[MAIL:console] To=${to} Subject="${subject}" Body=${text}`);
      return;
    }

    if (this.driver === 'sendgrid') {
      if (!this.sendgridReady) {
        this.logger.error('SendGrid not initialized; cannot send email');
        return;
      }
      await sgMail.send({ to, from, subject, text, html } as any);
      return;
    }

    if (!this.transporter) {
      this.logger.error('SMTP transporter not initialized; cannot send email');
      return;
    }
    await this.transporter.sendMail({ from, to, subject, text, html });
    this.logger.log(`[MAIL:smtp] To=${to} Subject="${subject}"`);
  }
}
