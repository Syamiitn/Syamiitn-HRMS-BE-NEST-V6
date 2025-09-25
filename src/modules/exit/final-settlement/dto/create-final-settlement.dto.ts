import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { FinalSettlementStatus } from '../entities/final-settlement.entity';

export class CreateFinalSettlementDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsDateString()
  lastWorkingDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  noticePeriodDays?: number;

  @IsDateString()
  @IsOptional()
  settlementDate?: string;

  @IsEnum(FinalSettlementStatus)
  @IsOptional()
  status?: FinalSettlementStatus;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  salaryDue?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  leaveEncashment?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  gratuity?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  bonus?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  otherEarnings?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  statutoryDeductions?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  otherDeductions?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  totalEarnings?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  totalDeductions?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  netPayable?: number;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]{2,40}$/)
  referenceCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  bankAccountId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  remarks?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

