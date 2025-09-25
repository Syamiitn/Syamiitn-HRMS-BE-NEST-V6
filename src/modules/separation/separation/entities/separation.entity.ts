import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum SeparationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  FINALIZED = 'finalized',
}

export enum AssetClearanceStatus {
  PENDING = 'pending',
  CLEARED = 'cleared',
  HOLD = 'hold',
  NOT_APPLICABLE = 'not_applicable',
}

@Entity({ name: 'separation' })
@Index('IDX_separation_employeeId', ['employeeId'])
@Index('IDX_separation_managerId', ['managerId'])
@Index('IDX_separation_status', ['status'])
@Index('IDX_separation_reasonId', ['reasonId'])
@Index('IDX_separation_noticePeriodEndDate', ['noticePeriodEndDate'])
export class Separation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  employeeId: number;

  @Column({ type: 'int', nullable: true })
  managerId?: number | null;

  @Column({ type: 'date' })
  intendedDate: string; // YYYY-MM-DD

  @Column({ type: 'date' })
  intendedLastWorkingDate: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  approvedLastWorkingDate?: string | null;

  @Column({ type: 'enum', enum: SeparationStatus, default: SeparationStatus.DRAFT })
  status: SeparationStatus;

  @Column({ type: 'char', length: 36, nullable: true })
  reasonId?: string | null;

  @Column({ type: 'text', nullable: true })
  reasonNote?: string | null;

  @Column({ type: 'int', nullable: true })
  noticePeriodDays?: number | null;

  @Column({ type: 'date', nullable: true })
  noticePeriodStartDate?: string | null;

  @Column({ type: 'date', nullable: true })
  noticePeriodEndDate?: string | null;

  @Column({ type: 'enum', enum: AssetClearanceStatus, default: AssetClearanceStatus.PENDING })
  assetStatus: AssetClearanceStatus;

  @Column({ type: 'int', nullable: true })
  changedBy?: number | null;

  @Column({ type: 'timestamp', nullable: true })
  changedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  remarks?: string | null;

  @Column({ type: 'int', nullable: true })
  finalizedBy?: number | null;

  @Column({ type: 'timestamp', nullable: true })
  finalizedAt?: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'char', length: 36, nullable: true })
  tenantId?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
