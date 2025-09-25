import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class QueryDesignationDto {
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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  departmentId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  minLevel?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxLevel?: number;

  @IsBoolean()
  @IsOptional()
  isManagerial?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsIn(['createdAt', 'name', 'level'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'level';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

