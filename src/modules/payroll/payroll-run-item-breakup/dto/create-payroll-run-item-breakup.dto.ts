import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { BreakupType } from '../entities/payroll-run-item-breakup.entity';

export class CreatePayrollRunItemBreakupDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  payrollRunItemId: number;

  @IsEnum(BreakupType)
  @IsNotEmpty()
  type: BreakupType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  componentName: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

