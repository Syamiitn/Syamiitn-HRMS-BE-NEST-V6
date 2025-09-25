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
} from 'class-validator';
import { StatutoryIdType } from '../entities/employee-statutory-id.entity';

export class CreateEmployeeStatutoryIdDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsEnum(StatutoryIdType)
  @IsOptional()
  type?: StatutoryIdType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9\-_.\/ ]{1,79}$/)
  idNumber: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  issuedBy?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @Matches(/^[A-Za-z]{2,3}$/)
  country?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

