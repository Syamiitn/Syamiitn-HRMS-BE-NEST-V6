import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TemplateCategory, TemplateFormat } from '../entities/template.entity';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class QueryTemplateDto {
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
  @MaxLength(400)
  @IsOptional()
  search?: string;

  @IsEnum(TemplateCategory)
  @IsOptional()
  category?: TemplateCategory;

  @IsEnum(TemplateFormat)
  @IsOptional()
  format?: TemplateFormat;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  ownerUserId?: number;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsIn(['createdAt', 'name', 'code', 'updatedAt'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'code' | 'updatedAt';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

