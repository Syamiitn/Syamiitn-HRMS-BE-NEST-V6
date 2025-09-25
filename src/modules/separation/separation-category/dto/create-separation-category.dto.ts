import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateSeparationCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^[A-Z0-9_\-]+$/)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @IsString()
  @IsOptional()
  @MaxLength(4000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

