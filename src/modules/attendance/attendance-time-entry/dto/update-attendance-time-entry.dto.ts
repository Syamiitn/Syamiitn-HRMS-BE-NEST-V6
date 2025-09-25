import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceTimeEntryDto } from './create-attendance-time-entry.dto';

export class UpdateAttendanceTimeEntryDto extends PartialType(CreateAttendanceTimeEntryDto) {}

