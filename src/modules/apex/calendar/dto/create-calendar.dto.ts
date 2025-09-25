import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCalendarDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]{2,40}$/)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  timezone: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @Matches(/^[A-Za-z]{2,3}$/)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  region?: string;

  @IsDateString()
  effectiveFrom: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

