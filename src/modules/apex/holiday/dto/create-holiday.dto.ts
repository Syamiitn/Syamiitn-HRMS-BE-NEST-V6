import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { HolidayType } from '../entities/holiday.entity';

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsDateString()
  date: string;

  @IsEnum(HolidayType)
  @IsOptional()
  type?: HolidayType;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  @Matches(/^[A-Za-z]{2,3}$/)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

