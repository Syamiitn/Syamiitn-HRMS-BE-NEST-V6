import { PartialType } from '@nestjs/mapped-types';
import { CreateExitChecklistMasterDto } from './create-exit-checklist-master.dto';

export class UpdateExitChecklistMasterDto extends PartialType(CreateExitChecklistMasterDto) {}

