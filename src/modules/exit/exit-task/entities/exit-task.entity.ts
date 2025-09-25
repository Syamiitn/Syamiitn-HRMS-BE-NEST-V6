import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExitTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity({ name: 'exit_tasks' })
@Index('IDX_exit_task_employee', ['employeeId'])
@Index('IDX_exit_task_status', ['status'])
@Index('IDX_exit_task_dueDate', ['dueDate'])
export class ExitTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: ExitTaskStatus, default: ExitTaskStatus.PENDING })
  status: ExitTaskStatus;

  @Column({ type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  assignedToId?: number | null;

  @Column({ type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

