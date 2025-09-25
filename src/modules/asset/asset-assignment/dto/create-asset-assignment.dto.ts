import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { AssignmentStatus } from '../entities/asset-assignment.entity';

export class CreateAssetAssignmentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assetId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsDateString()
  @IsOptional()
  assignedAt?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  conditionOnAssign?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  conditionOnReturn?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

