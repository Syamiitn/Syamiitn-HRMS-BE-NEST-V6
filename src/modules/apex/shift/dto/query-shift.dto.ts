import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class QueryShiftDto {
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

  @IsString()
  @MaxLength(160)
  @IsOptional()
  search?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minTotalMinutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxTotalMinutes?: number;

  @IsIn(['createdAt', 'name', 'totalMinutes'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'totalMinutes';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

