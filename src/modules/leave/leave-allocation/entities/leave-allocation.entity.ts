import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'leave_allocations' })
@Index('IDX_leave_alloc_employee', ['employeeId'])
@Index('IDX_leave_alloc_type', ['leaveTypeId'])
@Index('IDX_leave_alloc_year', ['year'])
export class LeaveAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'int', unsigned: true })
  leaveTypeId: number;

  @Column({ type: 'int', unsigned: true })
  year: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  allocatedDays: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  referenceCode?: string | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  allocatedBy?: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

