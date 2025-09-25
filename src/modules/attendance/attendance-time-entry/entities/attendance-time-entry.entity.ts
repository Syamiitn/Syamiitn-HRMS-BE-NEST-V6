import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TimeEntryType {
  WORK = 'work',
  BREAK = 'break',
  OVERTIME = 'overtime',
}

export enum TimeEntrySource {
  MANUAL = 'manual',
  SYSTEM = 'system',
}

@Entity({ name: 'attendance_time_entries' })
@Index('IDX_time_entry_employee', ['employeeId'])
@Index('IDX_time_entry_date', ['date'])
@Index('IDX_time_entry_type', ['type'])
export class AttendanceTimeEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'time' })
  startTime: string; // HH:MM[:SS]

  @Column({ type: 'time' })
  endTime: string; // HH:MM[:SS]

  @Column({ type: 'int', unsigned: true, default: 0 })
  durationMinutes: number;

  @Column({ type: 'enum', enum: TimeEntryType, default: TimeEntryType.WORK })
  type: TimeEntryType;

  @Column({ type: 'enum', enum: TimeEntrySource, default: TimeEntrySource.MANUAL })
  source: TimeEntrySource;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  approvedBy?: number | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

