import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum PayrollRunStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  PAID = 'paid',
  CANCELED = 'canceled',
}

@Entity({ name: 'payroll_runs' })
@Unique('UQ_payroll_period', ['periodStart', 'periodEnd'])
@Index('IDX_payroll_status', ['status'])
@Index('IDX_payroll_periodStart', ['periodStart'])
@Index('IDX_payroll_payDate', ['payDate'])
export class PayrollRun {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

  @Column({ type: 'date' })
  periodStart: string; // YYYY-MM-DD

  @Column({ type: 'date' })
  periodEnd: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  payDate?: string | null; // YYYY-MM-DD

  @Column({ type: 'enum', enum: PayrollRunStatus, default: PayrollRunStatus.DRAFT })
  status: PayrollRunStatus;

  @Column({ type: 'int', unsigned: true, default: 0 })
  totalEmployees: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalGross: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDeductions: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalNet: string;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

