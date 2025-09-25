import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class QueryLeaveAllocationDto {
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

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(3000)
  @IsOptional()
  year?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minDays?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxDays?: number;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  search?: string;

  @IsIn(['createdAt', 'year', 'allocatedDays'])
  @IsOptional()
  sortBy?: 'createdAt' | 'year' | 'allocatedDays';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

