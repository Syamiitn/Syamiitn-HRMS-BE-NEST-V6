import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { EmploymentType, EmployeeStatus, Gender } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  lastName: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]{2,40}$/)
  employeeCode: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[+0-9()\-\s]*$/)
  phone?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @IsDateString()
  hireDate: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  departmentId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  designation?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  managerId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressLine1?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressLine2?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @Matches(/^[A-Za-z]{2,3}$/)
  country?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

