import { Transform, Type } from 'class-transformer';
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
import { ReportingCycle } from '../entities/organization-settings.entity';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class CreateOrganizationSettingsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  organizationId: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  // Comma-separated ISO weekday codes (e.g., MON,TUE,...)
  @Matches(/^(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:,(?:MON|TUE|WED|THU|FRI|SAT|SUN)){0,6}$/)
  workingDaysCsv?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Matches(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)$/)
  weekStartDay?: string;

  @IsDateString()
  @IsOptional()
  fiscalYearStartDate?: string;

  @IsDateString()
  @IsOptional()
  fiscalYearEndDate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  defaultLeavePolicyId?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  defaultShiftId?: string;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isTwoFactorRequired?: boolean;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isAuditTrailEnabled?: boolean;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isGdprCompliant?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  dataRetentionDays?: number;

  @IsEnum(ReportingCycle)
  @IsOptional()
  reportingCycle?: ReportingCycle;

  @IsDateString()
  @IsOptional()
  lastSyncTimestamp?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  updatedByUserId?: number;
}

