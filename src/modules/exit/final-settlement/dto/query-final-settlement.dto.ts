import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { FinalSettlementStatus } from '../entities/final-settlement.entity';

export class QueryFinalSettlementDto {
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

  @IsEnum(FinalSettlementStatus)
  @IsOptional()
  status?: FinalSettlementStatus;

  @IsDateString()
  @IsOptional()
  lastWorkingFrom?: string;

  @IsDateString()
  @IsOptional()
  lastWorkingTo?: string;

  @IsDateString()
  @IsOptional()
  settlementFrom?: string;

  @IsDateString()
  @IsOptional()
  settlementTo?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  minNet?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  maxNet?: number;

  @IsIn(['createdAt', 'settlementDate', 'netPayable'])
  @IsOptional()
  sortBy?: 'createdAt' | 'settlementDate' | 'netPayable';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

