import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { OtpChannel, OtpCode, OtpPurpose } from './entities/otp-code.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../common/services/email.service';
import { SmsService } from '../../common/services/sms.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpCode) private readonly otpRepo: Repository<OtpCode>,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) { }

  private asDestObject(input: any): { email?: string; phone?: string } {
    if (!input) return {};
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        if (typeof parsed === 'string') {
          return { email: parsed, phone: parsed };
        }
        return parsed as any;
      } catch {
        return { email: input, phone: input };
      }
    }
    return input as any;
  }

  private generateNumericCode(length: number): string {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits[Math.floor(Math.random() * 10)];
    }
    return result;
  }

  private generateNumericCodeWithEight(length: number): string {
    if (length < 1) throw new Error('Length must be at least 1');

    const digits = '0123456789';
    let result = '';

    // Generate (length - 1) random digits
    for (let i = 0; i < length - 1; i++) {
      result += digits[Math.floor(Math.random() * 10)];
    }

    // Insert '8' at a random position
    const insertPos = Math.floor(Math.random() * length);
    result = result.slice(0, insertPos) + '8' + result.slice(insertPos);

    return result;
  }
  private generateCodeWithRandomT(length: number): string {
    if (length < 1) throw new Error('Length must be at least 1');

    const digits = '0123456789';
    let result = '';

    // Generate full-length numeric string
    for (let i = 0; i < length-1; i++) {
      result += digits[Math.floor(Math.random() * 10)];
    }

    // Choose a random position to insert 'T'
    const insertPos = Math.floor(Math.random() * (length));
    result = result.slice(0, insertPos) + 'T' + result.slice(insertPos);

    return result;
  }

  async createAndSend(
    userId: number | null,
    destination: object,
    channel: OtpChannel,
    purpose: OtpPurpose,
  ): Promise<{ challengeId: string }> {
    const length = this.config.get<number>('otp.length', 6);
    const ttlSeconds = this.config.get<number>('otp.ttlSeconds', 300);
    const saltRounds = this.config.get<number>('auth.saltRounds', 10);

    const code = this.generateCodeWithRandomT(length);
    const codeHash = await bcrypt.hash(code, saltRounds);

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const otp = this.otpRepo.create({
      userId: userId ?? undefined,
      destination: JSON.stringify(destination),
      channel,
      codeHash,
      purpose,
      expiresAt,
    });
    const saved = await this.otpRepo.save(otp);

    if (channel === OtpChannel.EMAIL) {
      await this.emailService.sendOtp(destination['email'], code);
    } else if (channel === OtpChannel.SMS) {
      await this.smsService.sendOtp(destination['phone'], code);
    } else {
      await this.emailService.sendOtp(destination['email'], code);
      await this.smsService.sendOtp(destination['phone'], code);
    }

    return { challengeId: saved.id };
  }

  async createPasswordReset(userId: number, email: string): Promise<{ challengeId: string }> {

    const length = this.config.get<number>('otp.length', 6);
    const ttlSeconds = this.config.get<number>('otp.ttlSeconds', 300);
    const saltRounds = this.config.get<number>('auth.saltRounds', 10);
    const publicUrl = this.config.get<string>('app.publicUrl', 'http://localhost:4200');

    const code = this.generateCodeWithRandomT(length);
    const codeHash = await bcrypt.hash(code, saltRounds);

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const otp = this.otpRepo.create({
      userId,
      destination: JSON.stringify({ email }),
      channel: OtpChannel.EMAIL,
      codeHash,
      purpose: OtpPurpose.RESET_PASSWORD,
      expiresAt,
    });

    const saved = await this.otpRepo.save(otp);

    const link = `${publicUrl.replace(/\/$/, '')}/reset-password?challengeId=${encodeURIComponent(saved.id)}&code=${encodeURIComponent(code)}`;
    await this.emailService.sendPasswordReset(email, link);
    return { challengeId: saved.id };
  }

  async verifyAndConsume(challengeId: string, code: string): Promise<OtpCode> {
    const otp = await this.otpRepo.findOne({ where: { id: challengeId } });

    if (!otp) throw new NotFoundException('Invalid or expired challenge');
    if (otp.consumedAt) throw new BadRequestException('Code already used');
    if (otp.expiresAt.getTime() < Date.now()) throw new BadRequestException('Code expired');

    otp.attempts += 1;
    const maxAttempts = this.config.get<number>('otp.maxAttempts', 5);
    if (otp.attempts > maxAttempts) {
      await this.otpRepo.save(otp);
      throw new BadRequestException('Maximum attempts exceeded');
    }
    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) {
      await this.otpRepo.save(otp);
      throw new BadRequestException('Invalid code');
    }

    otp.consumedAt = new Date();
    await this.otpRepo.save(otp);
    return otp;
  }

  async validate(challengeId: string, code: string): Promise<OtpCode> {
    const otp = await this.otpRepo.findOne({ where: { id: challengeId } });
    if (!otp) throw new NotFoundException('Invalid or expired challenge');
    if (otp.consumedAt) throw new BadRequestException('Code already used');
    if (otp.expiresAt.getTime() < Date.now()) throw new BadRequestException('Code expired');

    otp.attempts += 1;
    const maxAttempts = this.config.get<number>('otp.maxAttempts', 5);
    if (otp.attempts > maxAttempts) {
      await this.otpRepo.save(otp);
      throw new BadRequestException('Maximum attempts exceeded');
    }
    const ok = await bcrypt.compare(code, otp.codeHash);
    await this.otpRepo.save(otp);
    if (!ok) {
      throw new BadRequestException('Invalid code');
    }
    return otp;
  }

  async cleanupExpired(): Promise<number> {
    const res = await this.otpRepo.delete({ expiresAt: LessThan(new Date()) });
    return res.affected || 0;
  }

  async resend(challengeId: string): Promise<{ challengeId: string }> {
    const otp = await this.otpRepo.findOne({ where: { id: challengeId } });
    if (!otp) throw new NotFoundException('Invalid or expired challenge');
    if (otp.consumedAt) throw new BadRequestException('Code already used');

    const length = this.config.get<number>('otp.length', 6);
    const ttlSeconds = this.config.get<number>('otp.ttlSeconds', 300);
    const saltRounds = this.config.get<number>('auth.saltRounds', 10);

    const code = this.generateCodeWithRandomT(length);
    const codeHash = await bcrypt.hash(code, saltRounds);

    // Update existing challenge with a new code and expiry
    otp.codeHash = codeHash;
    otp.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    otp.attempts = 0;
    await this.otpRepo.save(otp);

    const dest = this.asDestObject(otp.destination);

    if (otp.channel === OtpChannel.EMAIL) {
      if (!dest.email) throw new BadRequestException('Email destination not available');
      await this.emailService.sendOtp(dest.email, code);
    } else if (otp.channel === OtpChannel.SMS) {
      if (!dest.phone) throw new BadRequestException('Phone destination not available');
      await this.smsService.sendOtp(dest.phone, code);
    } else {
      // ALL
      if (dest.email) await this.emailService.sendOtp(dest.email, code);
      if (dest.phone) await this.smsService.sendOtp(dest.phone, code);
      if (!dest.email && !dest.phone) throw new BadRequestException('No destinations available');
    }

    return { challengeId: otp.id };
  }
}
