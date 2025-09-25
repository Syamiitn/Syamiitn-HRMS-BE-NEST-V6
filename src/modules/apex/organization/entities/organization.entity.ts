import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'organization' })
@Unique('UQ_org_orgCode', ['orgCode'])
@Index('IDX_org_orgCode', ['orgCode'])
@Index('IDX_org_groupId', ['groupId'])
@Index('IDX_org_isActive', ['isActive'])
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  orgCode: string; // Internal short code

  @Column({ type: 'varchar', length: 120 })
  orgName: string; // Display name

  @Column({ type: 'varchar', length: 160, nullable: true })
  legalEntityName?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  domainName?: string | null; // e.g., 'tetriq.com'

  @Column({ type: 'varchar', length: 80, nullable: true })
  industryType?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  countryName?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  stateName?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  cityName?: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  defaultCurrency?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultTimezone?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  defaultLanguage?: string | null;

  @Column({ type: 'text', nullable: true })
  logoUrl?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  contactEmail?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone?: string | null;

  @Column({ type: 'char', length: 36, nullable: true })
  groupId?: string | null;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'groupId' })
  group?: Organization | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  createdByUserId?: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser?: User | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

