import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { LeaveRequestStatus } from '../entities/leave-request.entity';

export class CreateLeaveRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  leaveTypeId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;

  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  totalDays?: number;

  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  approvedBy?: number;

  @IsDateString()
  @IsOptional()
  approvedAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

