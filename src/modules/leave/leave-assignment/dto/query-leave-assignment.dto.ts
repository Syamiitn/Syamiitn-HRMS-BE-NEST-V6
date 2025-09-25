import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class QueryLeaveAssignmentDto {
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
  employeeId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  leaveTypeId?: number;

  @IsDateString()
  @IsOptional()
  periodStartFrom?: string;

  @IsDateString()
  @IsOptional()
  periodStartTo?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minBalance?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxBalance?: number;

  @IsIn(['createdAt', 'periodStart', 'balance'])
  @IsOptional()
  sortBy?: 'createdAt' | 'periodStart' | 'balance';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

