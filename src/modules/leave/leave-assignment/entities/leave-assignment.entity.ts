import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'leave_assignments' })
@Unique('UQ_leave_assignment_period', ['employeeId', 'leaveTypeId', 'periodStart', 'periodEnd'])
@Index('IDX_leave_assignment_employee', ['employeeId'])
@Index('IDX_leave_assignment_type', ['leaveTypeId'])
@Index('IDX_leave_assignment_start', ['periodStart'])
export class LeaveAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'int', unsigned: true })
  leaveTypeId: number;

  @Column({ type: 'date' })
  periodStart: string; // YYYY-MM-DD

  @Column({ type: 'date' })
  periodEnd: string; // YYYY-MM-DD

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  openingBalance: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  allocated: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  used: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  carriedForward: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  balance: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

