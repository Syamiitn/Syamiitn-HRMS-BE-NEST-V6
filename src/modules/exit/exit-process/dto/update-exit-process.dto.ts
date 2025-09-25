import { PartialType } from '@nestjs/mapped-types';
import { CreateExitProcessDto } from './create-exit-process.dto';

export class UpdateExitProcessDto extends PartialType(CreateExitProcessDto) {}

