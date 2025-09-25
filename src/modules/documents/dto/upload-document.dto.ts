import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, Matches } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @IsOptional()
  @MaxLength(160)
  title?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9a-fA-F-]{36}$/)
  documentId?: string; // if provided, creates a new version

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  ownerUserId?: number; // default from JWT if available
}

