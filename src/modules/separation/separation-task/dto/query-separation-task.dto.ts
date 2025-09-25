import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { SeparationTaskPriority, SeparationTaskStatus } from '../entities/separation-task.entity';

export class QuerySeparationTaskDto {
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
  @Matches(/^[0-9a-fA-F-]{36}$/)
  separationId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  assignedTo?: number;

  @IsEnum(SeparationTaskStatus)
  @IsOptional()
  status?: SeparationTaskStatus;

  @IsEnum(SeparationTaskPriority)
  @IsOptional()
  priority?: SeparationTaskPriority;

  @IsDateString()
  @IsOptional()
  dueFrom?: string;

  @IsDateString()
  @IsOptional()
  dueTo?: string;

  @IsString()
  @MaxLength(4000)
  @IsOptional()
  search?: string;

  @IsIn(['createdAt', 'dueDate', 'updatedAt'])
  @IsOptional()
  sortBy?: 'createdAt' | 'dueDate' | 'updatedAt';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

