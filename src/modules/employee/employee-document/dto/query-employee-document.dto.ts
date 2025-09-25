import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, IsIn } from 'class-validator';
import { DocumentType } from '../entities/employee-document.entity';

export class QueryEmployeeDocumentDto {
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

  @IsEnum(DocumentType)
  @IsOptional()
  type?: DocumentType;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MaxLength(160)
  @IsOptional()
  search?: string;

  @IsIn(['createdAt', 'issueDate', 'expiryDate'])
  @IsOptional()
  sortBy?: 'createdAt' | 'issueDate' | 'expiryDate';

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

