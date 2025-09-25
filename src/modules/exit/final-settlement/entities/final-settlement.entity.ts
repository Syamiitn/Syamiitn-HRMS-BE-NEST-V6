import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum FinalSettlementStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELED = 'canceled',
}

@Entity({ name: 'final_settlements' })
@Unique('UQ_final_settlement_ref', ['referenceCode'])
@Index('IDX_fs_employee', ['employeeId'])
@Index('IDX_fs_status', ['status'])
@Index('IDX_fs_settlementDate', ['settlementDate'])
export class FinalSettlement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'date' })
  lastWorkingDate: string; // YYYY-MM-DD

  @Column({ type: 'int', unsigned: true, nullable: true })
  noticePeriodDays?: number | null;

  @Column({ type: 'date', nullable: true })
  settlementDate?: string | null; // YYYY-MM-DD

  @Column({ type: 'enum', enum: FinalSettlementStatus, default: FinalSettlementStatus.DRAFT })
  status: FinalSettlementStatus;

  // Components and totals (stored as strings for decimal columns)
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  salaryDue: string; // pending salary

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  leaveEncashment: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  gratuity: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  bonus: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  otherEarnings: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalEarnings: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  statutoryDeductions: string; // tax/epf/esi etc.

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  otherDeductions: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDeductions: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  netPayable: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  referenceCode?: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  bankAccountId?: number | null; // optional target account

  @Column({ type: 'text', nullable: true })
  remarks?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

