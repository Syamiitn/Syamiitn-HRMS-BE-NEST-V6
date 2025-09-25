import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../user/entities/user.entity';

export enum ReportingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

@Entity({ name: 'organization_settings' })
@Index('IDX_settings_orgId', ['organizationId'])
@Index('IDX_settings_updatedByUser', ['updatedByUserId'])
export class OrganizationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ type: 'varchar', length: 30, default: 'MON,TUE,WED,THU,FRI' })
  workingDaysCsv: string;

  @Column({ type: 'varchar', length: 10, default: 'MONDAY' })
  weekStartDay: string;

  @Column({ type: 'date', nullable: true })
  fiscalYearStartDate?: string | null;

  @Column({ type: 'date', nullable: true })
  fiscalYearEndDate?: string | null;

  @Column({ type: 'char', length: 36, nullable: true })
  defaultLeavePolicyId?: string | null;

  @Column({ type: 'char', length: 36, nullable: true })
  defaultShiftId?: string | null;

  @Column({ type: 'boolean', default: false })
  isTwoFactorRequired: boolean;

  @Column({ type: 'boolean', default: true })
  isAuditTrailEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isGdprCompliant: boolean;

  @Column({ type: 'int', nullable: true })
  dataRetentionDays?: number | null;

  @Column({ type: 'enum', enum: ReportingCycle, default: ReportingCycle.MONTHLY })
  reportingCycle: ReportingCycle;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncTimestamp?: Date | null;

  @Column({ type: 'int', nullable: true })
  updatedByUserId?: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updatedByUserId' })
  updatedByUser?: User | null;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

