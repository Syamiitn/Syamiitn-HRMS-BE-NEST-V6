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
import { AttendanceStatus } from '../entities/attendance-day.entity';

export class CreateAttendanceDayDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsDateString()
  date: string;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  checkInTime?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  checkOutTime?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  workedMinutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  overtimeMinutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  lateMinutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  earlyLeaveMinutes?: number;

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
  remarks?: string;
}

