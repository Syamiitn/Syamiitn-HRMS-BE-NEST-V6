import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ValidateResetDto } from './dto/validate-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.emailOrPhone, dto.password);
  }

  @Public()
  @Post('2fa/verify')
  async verify(@Body() dto: VerifyOtpDto) {
    const tokens = await this.authService.verifyLoginOtp(dto.challengeId, dto.code);
    return tokens;
  }

  @Public()
  @Post('2fa/resend')
  async resend(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.challengeId);
  }

  // Password reset flow
  @Public()
  @Post('password/forgot')
  async forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('password/validate')
  async validateReset(@Body() dto: ValidateResetDto) {
    return this.authService.validatePasswordResetToken(dto.challengeId, dto.code);
  }

  @Public()
  @Post('password/reset')
  async reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.challengeId, dto.code, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/send')
  async sendEnable(@Req() req: any, @Body() dto: Enable2FADto) {
    // req.user is attached by guard strategy
    const user: any = (req as any).user;
    return this.authService.sendEnable2fa({ id: user.sub, email: user.email, role: user.role } as any, dto.channel);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/confirm')
  async confirmEnable(@Body() dto: VerifyOtpDto) {
    return this.authService.confirmEnable2fa(dto.challengeId, dto.code);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async profile(@Req() req: any) {
    return { user: (req as any).user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const user: any = (req as any).user;
    return this.authService.logout(user.sub);
  }

  // Logout current access token only (blacklist by JWT jti)
  @UseGuards(JwtAuthGuard)
  @Post('logout/token')
  async logoutToken(@Req() req: any) {
    const user: any = (req as any).user; // payload contains jti, exp
    return this.authService.revokeAccessToken(user.sub, user.jti, user.exp);
  }
}
