import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ExitTaskStatus } from '../entities/exit-task.entity';

export class QueryExitTaskDto {
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

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  assignedToId?: number;

  @IsEnum(ExitTaskStatus)
  @IsOptional()
  status?: ExitTaskStatus;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(160)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  dueFrom?: string;

  @IsDateString()
  @IsOptional()
  dueTo?: string;

  @IsDateString()
  @IsOptional()
  completedFrom?: string;

  @IsDateString()
  @IsOptional()
  completedTo?: string;

  @IsIn(['createdAt', 'dueDate', 'title'])
  @IsOptional()
  sortBy?: 'createdAt' | 'dueDate' | 'title';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

