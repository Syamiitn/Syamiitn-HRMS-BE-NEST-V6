import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  IsBoolean,
} from 'class-validator';
import { SeparationTaskPriority, SeparationTaskStatus } from '../entities/separation-task.entity';

export class CreateSeparationTaskDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  separationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  description?: string;

  @IsEnum(SeparationTaskPriority)
  @IsOptional()
  priority?: SeparationTaskPriority;

  @IsEnum(SeparationTaskStatus)
  @IsOptional()
  status?: SeparationTaskStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  assignedTo?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  remarks?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

