import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CalculationMethod, SalaryComponentType } from '../entities/salary-component.entity';

export class QuerySalaryComponentDto {
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

  @IsEnum(SalaryComponentType)
  @IsOptional()
  type?: SalaryComponentType;

  @IsEnum(CalculationMethod)
  @IsOptional()
  calculationMethod?: CalculationMethod;

  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @IsBoolean()
  @IsOptional()
  preTax?: boolean;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minAmount?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxAmount?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  minPercentage?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  maxPercentage?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minSequence?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxSequence?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsIn(['createdAt', 'name', 'sequence'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'sequence';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

