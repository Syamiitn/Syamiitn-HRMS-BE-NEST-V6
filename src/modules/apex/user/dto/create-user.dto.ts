import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_.-]{3,40}$/)
  username: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[+0-9()\-\s]*$/)
  phone?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @IsEnum(['email', 'sms', 'all'] as const)
  @IsOptional()
  twoFactorMethod?: 'email' | 'sms' | 'all';
}
