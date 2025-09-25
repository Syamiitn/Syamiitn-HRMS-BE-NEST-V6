import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateAuditLogDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  actorId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  actorType?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[A-Za-z0-9_\-\. ]+$/)
  action: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  entityName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  entityId: string;

  @IsObject()
  @IsOptional()
  changes?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  @MaxLength(45)
  @Matches(/^[0-9a-fA-F:\.]+$/)
  ipAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  userAgent?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  message?: string;

  @IsBoolean()
  @IsOptional()
  isSuccess?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

