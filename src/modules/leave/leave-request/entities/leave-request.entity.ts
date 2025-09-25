import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

@Entity({ name: 'leave_requests' })
@Index('IDX_leave_req_employee', ['employeeId'])
@Index('IDX_leave_req_type', ['leaveTypeId'])
@Index('IDX_leave_req_status', ['status'])
@Index('IDX_leave_req_startDate', ['startDate'])
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'int', unsigned: true })
  leaveTypeId: number;

  @Column({ type: 'date' })
  startDate: string; // YYYY-MM-DD

  @Column({ type: 'date' })
  endDate: string; // YYYY-MM-DD

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  totalDays: string; // stored as string by TypeORM

  @Column({ type: 'enum', enum: LeaveRequestStatus, default: LeaveRequestStatus.PENDING })
  status: LeaveRequestStatus;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'boolean', default: false })
  isHalfDay: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  approvedBy?: number | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

