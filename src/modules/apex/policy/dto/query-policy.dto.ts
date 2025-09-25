import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PolicyCategory } from '../entities/policy.entity';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class QueryPolicyDto {
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
  @MaxLength(400)
  search?: string;

  @IsEnum(PolicyCategory)
  @IsOptional()
  category?: PolicyCategory;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  visibleToRole?: string;

  @IsDateString()
  @IsOptional()
  effectiveFromFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveFromTo?: string;

  @IsDateString()
  @IsOptional()
  effectiveToFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveToTo?: string;

  @IsIn(['createdAt', 'effectiveFrom', 'effectiveTo', 'title', 'policyCode', 'updatedAt'])
  @IsOptional()
  sortBy?: 'createdAt' | 'effectiveFrom' | 'effectiveTo' | 'title' | 'policyCode' | 'updatedAt';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

