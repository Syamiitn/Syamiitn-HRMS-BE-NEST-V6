import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  HALF_DAY = 'half_day',
  LEAVE = 'leave',
  HOLIDAY = 'holiday',
  WFH = 'wfh',
}

@Entity({ name: 'attendance_days' })
@Unique('UQ_attendance_employee_date', ['employeeId', 'date'])
@Index('IDX_attendance_employee', ['employeeId'])
@Index('IDX_attendance_date', ['date'])
@Index('IDX_attendance_status', ['status'])
export class AttendanceDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ type: 'time', nullable: true })
  checkInTime?: string | null;

  @Column({ type: 'time', nullable: true })
  checkOutTime?: string | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  workedMinutes: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  overtimeMinutes: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  lateMinutes: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  earlyLeaveMinutes: number;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  approvedBy?: number | null;

  @Column({ type: 'text', nullable: true })
  remarks?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

