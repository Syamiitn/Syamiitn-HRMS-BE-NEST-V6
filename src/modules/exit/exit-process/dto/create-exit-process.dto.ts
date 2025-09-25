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
import { ExitProcessStatus } from '../entities/exit-process.entity';

export class CreateExitProcessDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsEnum(ExitProcessStatus)
  @IsOptional()
  status?: ExitProcessStatus;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  plannedExitDate?: string;

  @IsDateString()
  @IsOptional()
  actualExitDate?: string;

  @IsDateString()
  @IsOptional()
  exitInterviewDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  reason?: string;

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

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  clearanceNotes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

