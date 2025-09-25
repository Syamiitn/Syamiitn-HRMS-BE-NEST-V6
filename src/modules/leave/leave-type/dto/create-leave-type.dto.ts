import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLeaveTypeDto {
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
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxDaysPerYear?: number;

  @IsBoolean()
  @IsOptional()
  allowHalfDay?: boolean;

  @IsBoolean()
  @IsOptional()
  carryForward?: boolean;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxCarryForward?: number;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

