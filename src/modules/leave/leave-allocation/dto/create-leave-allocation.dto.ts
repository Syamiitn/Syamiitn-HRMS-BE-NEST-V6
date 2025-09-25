import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLeaveAllocationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  leaveTypeId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(3000)
  year: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  allocatedDays: number;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]{2,40}$/)
  referenceCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  allocatedBy?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

