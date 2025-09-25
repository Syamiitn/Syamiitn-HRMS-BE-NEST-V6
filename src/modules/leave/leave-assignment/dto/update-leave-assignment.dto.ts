import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveAssignmentDto } from './create-leave-assignment.dto';

export class UpdateLeaveAssignmentDto extends PartialType(CreateLeaveAssignmentDto) {}

