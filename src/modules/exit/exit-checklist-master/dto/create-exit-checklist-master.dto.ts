import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExitChecklistMasterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]{2,40}$/)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresAssetClearance?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresFinanceClearance?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresItClearance?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresHrInterview?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  defaultAssigneeId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3650)
  @IsOptional()
  estimatedDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

