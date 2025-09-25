import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { ReportingCycle } from '../entities/organization-settings.entity';

export class QueryOrganizationSettingsDto {
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
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  organizationId?: string;

  @IsEnum(ReportingCycle)
  @IsOptional()
  reportingCycle?: ReportingCycle;

  @IsDateString()
  @IsOptional()
  updatedFrom?: string;

  @IsDateString()
  @IsOptional()
  updatedTo?: string;

  @IsIn(['updatedAt'])
  @IsOptional()
  sortBy?: 'updatedAt';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

