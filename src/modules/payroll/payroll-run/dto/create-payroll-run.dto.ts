import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  IsNumber,
} from 'class-validator';
import { PayrollRunStatus } from '../entities/payroll-run.entity';

export class CreatePayrollRunDto {
  @IsString()
  @IsOptional()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]+$/)
  code?: string;

  @IsDateString()
  @IsNotEmpty()
  periodStart: string;

  @IsDateString()
  @IsNotEmpty()
  periodEnd: string;

  @IsDateString()
  @IsOptional()
  payDate?: string;

  @IsEnum(PayrollRunStatus)
  @IsOptional()
  status?: PayrollRunStatus;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  totalEmployees?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  totalGross?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  totalDeductions?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  totalNet?: number;

  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

