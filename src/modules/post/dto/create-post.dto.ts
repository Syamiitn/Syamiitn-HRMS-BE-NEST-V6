import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostType)
  type: PostType;

  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsArray()
  @ArrayMaxSize(100)
  departmentIds: number[]; // visibility scope
}

