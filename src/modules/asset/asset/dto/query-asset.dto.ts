import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AssetStatus } from '../entities/asset.entity';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }
  return undefined;
};

export class QueryAssetDto {
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

  @IsString()
  @MaxLength(120)
  @IsOptional()
  search?: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  category?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsIn(['createdAt', 'name', 'purchaseDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'name' | 'purchaseDate';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

