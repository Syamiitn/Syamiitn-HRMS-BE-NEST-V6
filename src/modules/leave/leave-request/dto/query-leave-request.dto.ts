import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { LeaveRequestStatus } from '../entities/leave-request.entity';

export class QueryLeaveRequestDto {
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

  @IsEnum(LeaveRequestStatus)
  @IsOptional()
  status?: LeaveRequestStatus;

  @IsDateString()
  @IsOptional()
  startFrom?: string;

  @IsDateString()
  @IsOptional()
  endTo?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  search?: string;

  @IsIn(['createdAt', 'startDate', 'endDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'startDate' | 'endDate';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

