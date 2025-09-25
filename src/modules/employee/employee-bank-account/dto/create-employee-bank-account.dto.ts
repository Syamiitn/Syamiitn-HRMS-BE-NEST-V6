import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { AccountType } from '../entities/employee-bank-account.entity';

export class CreateEmployeeBankAccountDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  accountHolderName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bankName: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  branchName?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]{8,34}$/)
  accountNumber: string;

  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  // Optional identifiers; validate format if provided
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i)
  swiftCode?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i)
  ifsc?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

