import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { SeparationStatus, AssetClearanceStatus } from '../entities/separation.entity';

export class QuerySeparationDto {
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
  managerId?: number;

  @IsEnum(SeparationStatus)
  @IsOptional()
  status?: SeparationStatus;

  @IsEnum(AssetClearanceStatus)
  @IsOptional()
  assetStatus?: AssetClearanceStatus;

  @IsDateString()
  @IsOptional()
  intendedFrom?: string;

  @IsDateString()
  @IsOptional()
  intendedTo?: string;

  @IsDateString()
  @IsOptional()
  lastWorkingFrom?: string;

  @IsDateString()
  @IsOptional()
  lastWorkingTo?: string;

  @IsString()
  @MaxLength(4000)
  @IsOptional()
  search?: string;

  @IsIn(['createdAt', 'intendedDate', 'intendedLastWorkingDate', 'approvedLastWorkingDate', 'noticePeriodEndDate', 'changedAt', 'finalizedAt'])
  @IsOptional()
  sortBy?: 'createdAt' | 'intendedDate' | 'intendedLastWorkingDate' | 'approvedLastWorkingDate' | 'noticePeriodEndDate' | 'changedAt' | 'finalizedAt';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  reasonId?: string;
}
