import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
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
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  endTime: string;

  @IsBoolean()
  @IsOptional()
  crossMidnight?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  breakMinutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  graceLateMinutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  graceEarlyMinutes?: number;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

