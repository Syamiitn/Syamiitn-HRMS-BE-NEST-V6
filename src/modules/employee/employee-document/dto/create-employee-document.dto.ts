import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { DocumentType } from '../entities/employee-document.entity';

export class CreateEmployeeDocumentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  employeeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  filePath: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(127)
  // simple media type format: type/subtype
  @Matches(/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/)
  mimeType: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  size: number;

  @IsString()
  @IsOptional()
  // YYYY-MM-DD
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  issueDate?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  expiryDate?: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

