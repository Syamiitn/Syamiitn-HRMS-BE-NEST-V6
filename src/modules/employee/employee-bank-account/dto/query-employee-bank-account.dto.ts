import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AccountType } from '../entities/employee-bank-account.entity';

export class QueryEmployeeBankAccountDto {
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

  @IsString()
  @MaxLength(120)
  @IsOptional()
  bankName?: string;

  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;
}

