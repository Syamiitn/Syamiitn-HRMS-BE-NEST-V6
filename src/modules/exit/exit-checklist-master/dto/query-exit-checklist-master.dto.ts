import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class QueryExitChecklistMasterDto {
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
  @MaxLength(160)
  @IsOptional()
  search?: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  defaultAssigneeId?: number;

  @IsIn(['createdAt', 'name', 'category'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'category';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

