import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum PolicyCategory {
  LEAVE = 'Leave',
  CONDUCT = 'Conduct',
  SECURITY = 'Security',
  IT = 'IT',
  COMPLIANCE = 'Compliance',
  OTHER = 'Other',
}

@Entity({ name: 'policy' })
@Index('IDX_policy_category', ['category'])
@Index('IDX_policy_isMandatory', ['isMandatory'])
@Index('IDX_policy_isActive', ['isActive'])
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  policyCode: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: PolicyCategory })
  category: PolicyCategory;

  @Column({ type: 'text', nullable: true })
  documentUrl?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'v1.0' })
  version: string;

  @Column({ type: 'date', nullable: true })
  effectiveFrom?: string | null;

  @Column({ type: 'date', nullable: true })
  effectiveTo?: string | null;

  @Column({ type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  visibleToRoles?: string[] | null;

  @Column({ type: 'int', nullable: true })
  createdByUserId?: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

