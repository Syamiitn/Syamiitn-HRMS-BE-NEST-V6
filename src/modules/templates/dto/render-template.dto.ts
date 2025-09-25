import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum ExportFormat {
  TEXT = 'text',
  HTML = 'html',
  PDF = 'pdf',
  DOCX = 'docx',
}

export class RenderTemplateDto {
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @IsEnum(ExportFormat)
  @IsOptional()
  exportAs?: ExportFormat; // default text/html based on template

  @IsBoolean()
  @IsOptional()
  failOnMissing?: boolean;
}

