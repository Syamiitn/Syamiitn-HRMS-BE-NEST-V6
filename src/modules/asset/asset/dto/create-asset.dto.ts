import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { AssetStatus } from '../entities/asset.entity';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return false;
};

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  // Allow alphanumerics, dashes and underscores
  @Matches(/^[A-Za-z0-9_-]+$/)
  assetTag: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  category: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  serialNumber?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  purchaseCost?: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  vendor?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

