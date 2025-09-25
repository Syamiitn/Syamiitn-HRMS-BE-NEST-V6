import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class QuerySeparationReasonDto {
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @IsString()
  @MaxLength(4000)
  @IsOptional()
  search?: string;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  tenantId?: string;

  @IsIn(['createdAt', 'name', 'updatedAt'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'updatedAt';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

