import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class QueryLocationDto {
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
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  state?: string;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  country?: string;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsIn(['createdAt', 'name', 'city'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'city';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

