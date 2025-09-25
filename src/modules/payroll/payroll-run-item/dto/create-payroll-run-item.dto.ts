import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PayrollRunItemStatus } from '../entities/payroll-run-item.entity';

export class CreatePayrollRunItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  payrollRunId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basicPay: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  allowances?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  deductions?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  grossPay?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  netPay?: number;

  @IsEnum(PayrollRunItemStatus)
  @IsOptional()
  status?: PayrollRunItemStatus;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  isActive?: boolean;
}

