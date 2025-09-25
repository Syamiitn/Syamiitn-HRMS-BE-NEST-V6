import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { TemplateCategory, TemplateFormat } from '../entities/template.entity';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(/^[A-Za-z0-9_.-]+$/)
  code: string;

  @IsEnum(TemplateCategory)
  category: TemplateCategory;

  @IsEnum(TemplateFormat)
  @IsOptional()
  format?: TemplateFormat;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @IsOptional()
  requiredPlaceholders?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  ownerUserId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

