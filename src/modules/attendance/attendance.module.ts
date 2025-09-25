import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceDayController } from './attendance-day/attendance-day.controller';
import { AttendanceDayService } from './attendance-day/attendance-day.service';
import { AttendanceDay } from './attendance-day/entities/attendance-day.entity';
import { AttendanceTimeEntry } from './attendance-time-entry/entities/attendance-time-entry.entity';
import { AttendanceTimeEntryController } from './attendance-time-entry/attendance-time-entry.controller';
import { AttendanceTimeEntryService } from './attendance-time-entry/attendance-time-entry.service';

@Module({
      imports: [TypeOrmModule.forFeature([AttendanceDay, AttendanceTimeEntry])],
      controllers: [AttendanceDayController, AttendanceTimeEntryController],
      providers: [AttendanceDayService, AttendanceTimeEntryService],
      exports: [TypeOrmModule],
})
export class AttendanceModule {}
