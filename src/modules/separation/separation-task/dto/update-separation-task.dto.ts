import { PartialType } from '@nestjs/mapped-types';
import { CreateSeparationTaskDto } from './create-separation-task.dto';

export class UpdateSeparationTaskDto extends PartialType(CreateSeparationTaskDto) {}

