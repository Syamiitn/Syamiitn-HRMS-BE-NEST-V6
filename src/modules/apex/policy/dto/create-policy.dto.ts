import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
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
import { PolicyCategory } from '../entities/policy.entity';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class CreatePolicyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]+$/)
  policyCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  description?: string;

  @IsEnum(PolicyCategory)
  category: PolicyCategory;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  documentUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  version?: string;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @IsOptional()
  visibleToRoles?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  createdByUserId?: number;
}

