import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum BreakupType {
  EARNING = 'earning',
  DEDUCTION = 'deduction',
}

@Entity({ name: 'payroll_run_item_breakups' })
@Unique('UQ_breakup_per_item', ['payrollRunItemId', 'type', 'componentName'])
@Index('IDX_breakup_item', ['payrollRunItemId'])
@Index('IDX_breakup_type', ['type'])
export class PayrollRunItemBreakup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  payrollRunItemId: number;

  @Column({ type: 'enum', enum: BreakupType, default: BreakupType.EARNING })
  type: BreakupType;

  @Column({ type: 'varchar', length: 120 })
  componentName: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amount: string;

  @Column({ type: 'boolean', default: false })
  isTaxable: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

