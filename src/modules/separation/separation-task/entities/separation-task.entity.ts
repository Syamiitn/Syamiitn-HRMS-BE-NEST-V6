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
import { Separation } from '../../separation/entities/separation.entity';

export enum SeparationTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum SeparationTaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity({ name: 'separation_task' })
@Index('IDX_separation_task_separationId', ['separationId'])
@Index('IDX_separation_task_status', ['status'])
@Index('IDX_separation_task_assignedTo', ['assignedTo'])
@Index('IDX_separation_task_dueDate', ['dueDate'])
export class SeparationTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  separationId: string;

  @ManyToOne(() => Separation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'separationId' })
  separation?: Separation;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: SeparationTaskPriority, default: SeparationTaskPriority.MEDIUM })
  priority: SeparationTaskPriority;

  @Column({ type: 'enum', enum: SeparationTaskStatus, default: SeparationTaskStatus.PENDING })
  status: SeparationTaskStatus;

  @Column({ type: 'int', nullable: true })
  assignedTo?: number | null; // users.id

  @Column({ type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'int', nullable: true })
  completedBy?: number | null; // users.id

  @Column({ type: 'text', nullable: true })
  remarks?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

