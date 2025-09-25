import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ExitProcessStatus } from '../entities/exit-process.entity';

export class QueryExitProcessDto {
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
  employeeId?: number;

  @IsEnum(ExitProcessStatus)
  @IsOptional()
  status?: ExitProcessStatus;

  @IsBoolean()
  @IsOptional()
  assetsCleared?: boolean;

  @IsBoolean()
  @IsOptional()
  financeCleared?: boolean;

  @IsBoolean()
  @IsOptional()
  itCleared?: boolean;

  @IsBoolean()
  @IsOptional()
  hrCleared?: boolean;

  @IsBoolean()
  @IsOptional()
  managerCleared?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  startFrom?: string;

  @IsDateString()
  @IsOptional()
  startTo?: string;

  @IsDateString()
  @IsOptional()
  plannedFrom?: string;

  @IsDateString()
  @IsOptional()
  plannedTo?: string;

  @IsDateString()
  @IsOptional()
  actualFrom?: string;

  @IsDateString()
  @IsOptional()
  actualTo?: string;

  @IsIn(['createdAt', 'startDate', 'plannedExitDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'startDate' | 'plannedExitDate';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

