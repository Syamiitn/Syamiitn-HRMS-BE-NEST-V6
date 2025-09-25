import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  IsNumber,
  Max,
} from 'class-validator';
import { AddressType } from '../entities/employee-address.entity';

export class CreateEmployeeAddressDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsEnum(AddressType)
  @IsOptional()
  type?: AddressType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  line1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  line2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[A-Za-z0-9 \-]{0,20}$/)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @Matches(/^[A-Za-z]{2,3}$/)
  country?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

