import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'exit_checklist_master' })
@Unique('UQ_exit_checklist_master_name', ['name'])
@Unique('UQ_exit_checklist_master_code', ['code'])
@Index('IDX_exit_checklist_master_category', ['category'])
@Index('IDX_exit_checklist_master_isActive', ['isActive'])
export class ExitChecklistMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  category?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false })
  isMandatory: boolean;

  @Column({ type: 'boolean', default: false })
  requiresAssetClearance: boolean;

  @Column({ type: 'boolean', default: false })
  requiresFinanceClearance: boolean;

  @Column({ type: 'boolean', default: false })
  requiresItClearance: boolean;

  @Column({ type: 'boolean', default: false })
  requiresHrInterview: boolean;

  @Column({ type: 'int', unsigned: true, nullable: true })
  defaultAssigneeId?: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  estimatedDays?: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

