import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum PayrollRunItemStatus {
  DRAFT = 'draft',
  PROCESSED = 'processed',
  PAID = 'paid',
  CANCELED = 'canceled',
}

@Entity({ name: 'payroll_run_items' })
@Unique('UQ_payroll_item_run_employee', ['payrollRunId', 'employeeId'])
@Index('IDX_payroll_item_run', ['payrollRunId'])
@Index('IDX_payroll_item_employee', ['employeeId'])
export class PayrollRunItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  payrollRunId: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  basicPay: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  allowances: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  deductions: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  grossPay: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  netPay: string;

  @Column({ type: 'enum', enum: PayrollRunItemStatus, default: PayrollRunItemStatus.DRAFT })
  status: PayrollRunItemStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

