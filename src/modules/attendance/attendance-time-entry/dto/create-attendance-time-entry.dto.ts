import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { TimeEntrySource, TimeEntryType } from '../entities/attendance-time-entry.entity';

export class CreateAttendanceTimeEntryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  endTime: string;

  @IsEnum(TimeEntryType)
  @IsOptional()
  type?: TimeEntryType;

  @IsEnum(TimeEntrySource)
  @IsOptional()
  source?: TimeEntrySource;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  approvedBy?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

