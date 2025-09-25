import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio, { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio | null = null;
  private driver: string;
  private from: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.driver = this.config.get<string>('sms.driver', 'console');
    if (this.driver === 'twilio') {
      const sid = this.config.get<string>('sms.twilioAccountSid');
      const token = this.config.get<string>('sms.twilioAuthToken');
      this.from = this.config.get<string>('sms.twilioFrom');
      if (sid && token) {
        this.client = twilio(sid, token);
      }
    }
  }

  async sendOtp(to: string, code: string): Promise<void> {
    const body = `Your SOGO OTP is: ${code}`;
    if (this.driver === 'console' || !this.client) {
      this.logger.log(`[SMS:console] To=${to} Body=${body}`);
      return;
    }
    if (!this.from) {
      throw new Error('SMS from number not configured');
    }
    this.logger.log(`[SMS:twilio] Sending OTP to ${to}`,to, this.from, body);
    await this.client.messages.create({ to, from: this.from, body });
  }

  async sendPasswordResetSuccess(to: string): Promise<void> {
    const body = `Your password has been reset successfully. If this wasn't you, contact support immediately.`;
    if (this.driver === 'console' || !this.client) {
      this.logger.log(`[SMS:console] To=${to} Body=${body}`);
      return;
    }
    if (!this.from) {
      throw new Error('SMS from number not configured');
    }
    this.logger.log(`[SMS:twilio] Sending reset-success to ${to}`);
    await this.client.messages.create({ to, from: this.from, body });
  }
}
