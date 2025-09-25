import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BreakupType } from '../entities/payroll-run-item-breakup.entity';

export class QueryPayrollRunItemBreakupDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  payrollRunItemId?: number;

  @IsEnum(BreakupType)
  @IsOptional()
  type?: BreakupType;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxAmount?: number;

  @IsIn(['createdAt', 'amount', 'componentName'])
  @IsOptional()
  sortBy?: 'createdAt' | 'amount' | 'componentName';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

