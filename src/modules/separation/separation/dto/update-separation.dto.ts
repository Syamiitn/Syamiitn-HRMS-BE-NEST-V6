import { PartialType } from '@nestjs/mapped-types';
import { CreateSeparationDto } from './create-separation.dto';

export class UpdateSeparationDto extends PartialType(CreateSeparationDto) {}

