import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PayrollRunStatus } from '../entities/payroll-run.entity';

export class QueryPayrollRunDto {
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

  @IsEnum(PayrollRunStatus)
  @IsOptional()
  status?: PayrollRunStatus;

  @IsString()
  @MaxLength(40)
  @IsOptional()
  code?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  periodStartFrom?: string;

  @IsDateString()
  @IsOptional()
  periodStartTo?: string;

  @IsDateString()
  @IsOptional()
  payDateFrom?: string;

  @IsDateString()
  @IsOptional()
  payDateTo?: string;

  @IsIn(['createdAt', 'periodStart', 'payDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'periodStart' | 'payDate';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

