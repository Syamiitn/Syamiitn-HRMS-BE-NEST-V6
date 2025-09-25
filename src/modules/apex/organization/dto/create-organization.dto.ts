import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  return undefined;
};

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  // allow alphanumerics, hyphen, underscore only
  @Matches(/^[A-Za-z0-9_-]+$/)
  orgCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  orgName: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  legalEntityName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  // simple domain pattern without protocol/path
  @Matches(/^(?!-)([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/)
  domainName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  industryType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  countryName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  stateName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  cityName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  @Matches(/^[A-Z]{3}|[A-Za-z0-9]{1,10}$/)
  defaultCurrency?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  defaultTimezone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  defaultLanguage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  logoUrl?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(160)
  contactEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[0-9+()\-\s]{6,20}$/)
  contactPhone?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  groupId?: string;

  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  createdByUserId?: number;
}

