import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLocationDto {
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

  @IsString()
  @IsOptional()
  @MaxLength(64)
  timezone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[+0-9()\-\s]*$/)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(160)
  email?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

