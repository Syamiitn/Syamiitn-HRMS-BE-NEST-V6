import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../apex/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpChannel, OtpPurpose } from './entities/otp-code.entity';
import { OtpService } from './otp.service';
import { RevokedToken } from './entities/revoked-token.entity';
import { EmailService } from '../../common/services/email.service';
import { SmsService } from '../../common/services/sms.service';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  ver: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(RevokedToken) private readonly revokedRepo: Repository<RevokedToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) { }

  private async findUserWithPassword(emailOrPhone: string): Promise<(User & { passwordHash: string }) | null> {
    const qb = this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :val OR u.phone = :val', { val: emailOrPhone })
      .andWhere('u.isActive = :active', { active: true });
    const user = await qb.getOne();
    return (user as any) || null;
  }

  private async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private async signTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, ver: (user as any).tokenVersion ?? 0 } as any;
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('auth.jwtSecret'),
      expiresIn: this.config.get<string>('auth.jwtExpiresIn'),
      jwtid: (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 24),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('auth.refreshSecret') || this.config.get<string>('auth.jwtSecret'),
      expiresIn: this.config.get<string>('auth.refreshExpiresIn'),
      jwtid: (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 24),
    });
    return { accessToken, refreshToken };
  }

  private hashPassword(password: string): string {
    if (!password || password.length < 8)
      throw new BadRequestException('Password must be at least 8 characters');
    const rounds = this.config.get<number>('auth.saltRounds', 10);
    return bcrypt.hashSync(password, rounds);
  }

  async login(emailOrPhone: string, password: string) {
    const user = await this.findUserWithPassword(emailOrPhone);
    if (!user) throw new UnauthorizedException('Invalid phone or email');
    const ok = await this.validatePassword(password, (user as any).passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid password');
    
    if (user.twoFactorEnabled && user.twoFactorMethod) {
     
      const channel = { sms: OtpChannel.SMS, email: OtpChannel.EMAIL }[user.twoFactorMethod] ?? OtpChannel.ALL;
     
      const destination = {
        ...(user.twoFactorMethod === 'email' && { email: user.email }),
        ...(user.twoFactorMethod === 'sms' && { phone: user.phone }),
        ...(user.twoFactorMethod === 'all' && { email: user.email, phone: user.phone }),
      };
      
      if (!destination) throw new BadRequestException('2FA destination not available');
      const { challengeId } = await this.otpService.createAndSend(user.id, destination, channel, OtpPurpose.LOGIN);
      return { requires2FA: true, challengeId };
    }

    const tokens = await this.signTokens(user);
    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });
    return { requires2FA: false, ...tokens };
  }

  async verifyLoginOtp(challengeId: string, code: string) {
    const otp = await this.otpService.verifyAndConsume(challengeId, code);
    if (otp.purpose !== OtpPurpose.LOGIN) throw new BadRequestException('Invalid challenge purpose');
    if (!otp.userId) throw new BadRequestException('Invalid challenge user');
    const user = await this.usersRepo.findOne({ where: { id: otp.userId } });
    if (!user) throw new BadRequestException('User not found');
    const tokens = await this.signTokens(user);
    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });
    return tokens;
  }

  async resendOtp(challengeId: string) {
    return this.otpService.resend(challengeId);
  }

  async requestPasswordReset(email: string): Promise<{ ok: true }> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.isActive) {
      // Do not reveal whether the email exists
      return { ok: true };
    }
    const result = await this.otpService.createPasswordReset(user.id, user.email);
    return { ok: true, ...result };
  }

  async validatePasswordResetToken(challengeId: string, code: string): Promise<{ valid: true }> {
    const otp = await this.otpService.validate(challengeId, code);
    if (otp.purpose !== OtpPurpose.RESET_PASSWORD) throw new BadRequestException('Invalid challenge purpose');
    return { valid: true };
  }

  async resetPassword(challengeId: string, code: string, newPassword: string): Promise<{ success: true }> {
    const otp = await this.otpService.verifyAndConsume(challengeId, code);
    if (otp.purpose !== OtpPurpose.RESET_PASSWORD) throw new BadRequestException('Invalid challenge purpose');
    if (!otp.userId) throw new BadRequestException('Invalid challenge user');
    const user = await this.usersRepo.findOne({ where: { id: otp.userId } });
    if (!user) throw new BadRequestException('User not found');
    const passwordHash = this.hashPassword(newPassword);
    await this.usersRepo.update(user.id, { passwordHash });
    // Notify via email and SMS (best-effort)
    try {
      if (user.email) await this.emailService.sendPasswordResetSuccess(user.email);
    } catch (e) {}
    try {
      if (user.phone) await this.smsService.sendPasswordResetSuccess(user.phone);
    } catch (e) {}
    return { success: true };
  }

  async sendEnable2fa(user: Pick<User, 'id'>, channel: 'email' | 'sms' | 'all') {
    const fullUser = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!fullUser) throw new BadRequestException('User not found');
    const destination = {
      ...(channel === 'email' && { email: fullUser.email }),
      ...(channel === 'sms' && { phone: fullUser.phone }),
      ...(channel === 'all' && { email: fullUser.email, phone: fullUser.phone }),
    } as any;
    if ((channel === 'email' && !destination.email) || (channel === 'sms' && !destination.phone) || (channel === 'all' && !destination.email && !destination.phone)) {
      throw new BadRequestException(`User ${channel} not set`);
    }
    const otpChannel = channel === 'email' ? OtpChannel.EMAIL : (channel === 'sms' ? OtpChannel.SMS : OtpChannel.ALL);
    const { challengeId } = await this.otpService.createAndSend(fullUser.id, destination, otpChannel, OtpPurpose.ENABLE_2FA);
    return { challengeId };
  }

  async confirmEnable2fa(challengeId: string, code: string) {
    const otp = await this.otpService.verifyAndConsume(challengeId, code);
    if (otp.purpose !== OtpPurpose.ENABLE_2FA) throw new BadRequestException('Invalid challenge purpose');
    if (!otp.userId) throw new BadRequestException('Invalid challenge user');
    const user = await this.usersRepo.findOne({ where: { id: otp.userId } });
    if (!user) throw new BadRequestException('User not found');
    user.twoFactorEnabled = true;
    user.twoFactorMethod =
      otp.channel === OtpChannel.EMAIL
        ? 'email'
        : otp.channel === OtpChannel.SMS
        ? 'sms'
        : 'all';
    await this.usersRepo.save(user);
    return { success: true };
  }

  async disable2fa(userId: number) {
    await this.usersRepo.update(userId, { twoFactorEnabled: false, twoFactorMethod: null });
    return { success: true };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('auth.refreshSecret') || this.config.get<string>('auth.jwtSecret'),
      });
      const user = await this.usersRepo.findOne({ where: { id: decoded.sub } });
      if (!user || !user.isActive) throw new UnauthorizedException();
      const tokenVer = typeof decoded.ver === 'number' ? decoded.ver : 0;
      if (tokenVer !== user.tokenVersion) throw new UnauthorizedException();
      return this.signTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number): Promise<{ success: true }> {
    // Increment tokenVersion to invalidate all existing tokens
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    await this.usersRepo.update(userId, { tokenVersion: (user.tokenVersion || 0) + 1 });
    return { success: true };
  }

  async revokeAccessToken(userId: number, jti: string, exp?: number): Promise<{ success: true }> {
    if (!jti) return { success: true };
    const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 60 * 60 * 1000);
    const existing = await this.revokedRepo.findOne({ where: { jti } });
    if (!existing) {
      const rec = this.revokedRepo.create({ jti, userId, expiresAt });
      await this.revokedRepo.save(rec);
    }
    return { success: true };
  }
}
