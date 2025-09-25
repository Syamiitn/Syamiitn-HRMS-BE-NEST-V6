import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CalculationMethod, SalaryComponentType } from '../entities/salary-component.entity';

export class CreateSalaryComponentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]{2,40}$/)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(SalaryComponentType)
  @IsOptional()
  type?: SalaryComponentType;

  @IsEnum(CalculationMethod)
  @IsOptional()
  calculationMethod?: CalculationMethod;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  amount?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @IsOptional()
  percentage?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  formula?: string;

  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @IsBoolean()
  @IsOptional()
  preTax?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Matches(/^[A-Za-z0-9_,\- ]+$/)
  dependsOnCodes?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  sequence?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

