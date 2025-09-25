import { PartialType } from '@nestjs/mapped-types';
import { CreateExitTaskDto } from './create-exit-task.dto';

export class UpdateExitTaskDto extends PartialType(CreateExitTaskDto) {}

