import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpCode } from './entities/otp-code.entity';
import { RevokedToken } from './entities/revoked-token.entity';
import { User } from '../apex/user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailService } from '../../common/services/email.service';
import { SmsService } from '../../common/services/sms.service';
import { OtpService } from './otp.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtSecret'),
        signOptions: { expiresIn: config.get<string>('auth.jwtExpiresIn') },
      }),
    }),
    TypeOrmModule.forFeature([User, OtpCode, RevokedToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService, SmsService, OtpService],
  exports: [AuthService],
})
export class AuthModule {}
