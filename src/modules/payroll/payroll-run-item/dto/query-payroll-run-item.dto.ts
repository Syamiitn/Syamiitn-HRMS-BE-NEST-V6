import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PayrollRunItemStatus } from '../entities/payroll-run-item.entity';

export class QueryPayrollRunItemDto {
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
  payrollRunId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  employeeId?: number;

  @IsEnum(PayrollRunItemStatus)
  @IsOptional()
  status?: PayrollRunItemStatus;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  search?: string;

  @IsIn(['createdAt', 'grossPay', 'netPay'])
  @IsOptional()
  sortBy?: 'createdAt' | 'grossPay' | 'netPay';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

