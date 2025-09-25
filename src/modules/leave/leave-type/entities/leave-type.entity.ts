import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'leave_types' })
@Unique('UQ_leave_type_name', ['name'])
@Unique('UQ_leave_type_code', ['code'])
@Index('IDX_leave_type_isActive', ['isActive'])
export class LeaveType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  // Allow fractional leave days up to 2 decimals
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  maxDaysPerYear: string;

  @Column({ type: 'boolean', default: false })
  allowHalfDay: boolean;

  @Column({ type: 'boolean', default: false })
  carryForward: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  maxCarryForward: string;

  @Column({ type: 'boolean', default: true })
  requiresApproval: boolean;

  @Column({ type: 'boolean', default: true })
  isPaid: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

