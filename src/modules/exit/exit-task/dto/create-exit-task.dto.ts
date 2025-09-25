import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ExitTaskStatus } from '../entities/exit-task.entity';

export class CreateExitTaskDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(ExitTaskStatus)
  @IsOptional()
  status?: ExitTaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  assignedToId?: number;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

