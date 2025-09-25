import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AssignmentStatus } from '../entities/asset-assignment.entity';

export class QueryAssetAssignmentDto {
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
  assetId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  employeeId?: number;

  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;
}

