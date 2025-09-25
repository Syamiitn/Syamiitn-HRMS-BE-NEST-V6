import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { AssetClearanceStatus, SeparationStatus } from '../entities/separation.entity';

export class CreateSeparationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  managerId?: number;

  @IsDateString()
  intendedDate: string;

  @IsDateString()
  intendedLastWorkingDate: string;

  @IsDateString()
  @IsOptional()
  approvedLastWorkingDate?: string;

  @IsEnum(SeparationStatus)
  @IsOptional()
  status?: SeparationStatus;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  tenantId?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  reasonId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  reasonNote?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  noticePeriodDays?: number;

  @IsDateString()
  @IsOptional()
  noticePeriodStartDate?: string;

  @IsDateString()
  @IsOptional()
  noticePeriodEndDate?: string;

  @IsEnum(AssetClearanceStatus)
  @IsOptional()
  assetStatus?: AssetClearanceStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  changedBy?: number;

  @IsDateString()
  @IsOptional()
  changedAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  remarks?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  finalizedBy?: number;

  @IsDateString()
  @IsOptional()
  finalizedAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
