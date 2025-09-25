import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDayDto } from './create-attendance-day.dto';

export class UpdateAttendanceDayDto extends PartialType(CreateAttendanceDayDto) {}

