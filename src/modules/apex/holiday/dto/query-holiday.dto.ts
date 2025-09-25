import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { HolidayType } from '../entities/holiday.entity';

export class QueryHolidayDto {
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
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsEnum(HolidayType)
  @IsOptional()
  type?: HolidayType;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  country?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  state?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  city?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsIn(['createdAt', 'date', 'name'])
  @IsOptional()
  sortBy?: 'createdAt' | 'date' | 'name';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

