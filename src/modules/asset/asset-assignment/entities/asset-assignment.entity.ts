import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AssignmentStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
  DAMAGED = 'damaged',
}

@Entity({ name: 'asset_assignments' })
@Index('IDX_asset_assignment_assetId', ['assetId'])
@Index('IDX_asset_assignment_employeeId', ['employeeId'])
export class AssetAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  assetId: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt?: Date | null;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.ACTIVE })
  status: AssignmentStatus;

  @Column({ type: 'varchar', length: 120, nullable: true })
  conditionOnAssign?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  conditionOnReturn?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

