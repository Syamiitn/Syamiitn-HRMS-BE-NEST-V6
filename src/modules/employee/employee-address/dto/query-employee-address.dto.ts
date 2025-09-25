import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AddressType } from '../entities/employee-address.entity';

export class QueryEmployeeAddressDto {
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

  @IsEnum(AddressType)
  @IsOptional()
  type?: AddressType;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  state?: string;

  @IsString()
  @MaxLength(3)
  @IsOptional()
  country?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(160)
  @IsOptional()
  search?: string;

  @IsDateString()
  @IsOptional()
  fromFrom?: string;

  @IsDateString()
  @IsOptional()
  fromTo?: string;

  @IsDateString()
  @IsOptional()
  toFrom?: string;

  @IsDateString()
  @IsOptional()
  toTo?: string;

  @IsIn(['createdAt', 'city', 'fromDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'city' | 'fromDate';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

