import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class QueryCalendarDto {
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

  @IsString()
  @MaxLength(3)
  @IsOptional()
  country?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  region?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  effectiveFromFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveFromTo?: string;

  @IsDateString()
  @IsOptional()
  effectiveToFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveToTo?: string;

  @IsIn(['createdAt', 'name', 'effectiveFrom'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'effectiveFrom';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

