import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class QuerySeparationCategoryDto {
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
  @MaxLength(200)
  search?: string;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsIn(['createdAt', 'label', 'code', 'updatedAt'])
  @IsOptional()
  sortBy?: 'createdAt' | 'label' | 'code' | 'updatedAt';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

