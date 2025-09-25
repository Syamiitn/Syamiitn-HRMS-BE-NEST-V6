import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TimeEntrySource, TimeEntryType } from '../entities/attendance-time-entry.entity';

export class QueryAttendanceTimeEntryDto {
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

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsEnum(TimeEntryType)
  @IsOptional()
  type?: TimeEntryType;

  @IsEnum(TimeEntrySource)
  @IsOptional()
  source?: TimeEntrySource;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsIn(['createdAt', 'date', 'startTime'])
  @IsOptional()
  sortBy?: 'createdAt' | 'date' | 'startTime';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

