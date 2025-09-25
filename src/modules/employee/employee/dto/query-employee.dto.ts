import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { EmploymentType, EmployeeStatus, Gender } from '../entities/employee.entity';

export class QueryEmployeeDto {
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
  managerId?: number;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsIn(['createdAt', 'firstName', 'hireDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'firstName' | 'hireDate';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

