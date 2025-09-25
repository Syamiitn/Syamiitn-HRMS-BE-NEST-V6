import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { StatutoryIdType } from '../entities/employee-statutory-id.entity';

export class QueryEmployeeStatutoryIdDto {
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

  @IsEnum(StatutoryIdType)
  @IsOptional()
  type?: StatutoryIdType;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  country?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  issueFrom?: string;

  @IsDateString()
  @IsOptional()
  issueTo?: string;

  @IsDateString()
  @IsOptional()
  expiryFrom?: string;

  @IsDateString()
  @IsOptional()
  expiryTo?: string;

  @IsIn(['createdAt', 'expiryDate', 'idNumber'])
  @IsOptional()
  sortBy?: 'createdAt' | 'expiryDate' | 'idNumber';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

