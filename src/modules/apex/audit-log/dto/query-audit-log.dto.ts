import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class QueryAuditLogDto {
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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  actorId?: number;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  action?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  entityName?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  entityId?: string;

  @IsBoolean()
  @IsOptional()
  isSuccess?: boolean;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @IsIn(['createdAt', 'action', 'entityName'])
  @IsOptional()
  sortBy?: 'createdAt' | 'action' | 'entityName';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

