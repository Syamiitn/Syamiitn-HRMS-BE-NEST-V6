import { PartialType } from '@nestjs/mapped-types';
import { CreateSeparationCategoryDto } from './create-separation-category.dto';

export class UpdateSeparationCategoryDto extends PartialType(CreateSeparationCategoryDto) {}

