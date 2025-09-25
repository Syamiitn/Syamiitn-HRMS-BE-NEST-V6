import { PartialType } from '@nestjs/mapped-types';
import { CreateSeparationReasonDto } from './create-separation-reason.dto';

export class UpdateSeparationReasonDto extends PartialType(CreateSeparationReasonDto) {}

