import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ExitProcessStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  CLEARED = 'cleared',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity({ name: 'exit_processes' })
@Index('IDX_exit_process_employee', ['employeeId'])
@Index('IDX_exit_process_status', ['status'])
@Index('IDX_exit_process_start', ['startDate'])
@Index('IDX_exit_process_planned', ['plannedExitDate'])
@Index('IDX_exit_process_actual', ['actualExitDate'])
export class ExitProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'enum', enum: ExitProcessStatus, default: ExitProcessStatus.INITIATED })
  status: ExitProcessStatus;

  @Column({ type: 'date' })
  startDate: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  plannedExitDate?: string | null;

  @Column({ type: 'date', nullable: true })
  actualExitDate?: string | null;

  @Column({ type: 'date', nullable: true })
  exitInterviewDate?: string | null;

  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @Column({ type: 'boolean', default: false })
  assetsCleared: boolean;

  @Column({ type: 'boolean', default: false })
  financeCleared: boolean;

  @Column({ type: 'boolean', default: false })
  itCleared: boolean;

  @Column({ type: 'boolean', default: false })
  hrCleared: boolean;

  @Column({ type: 'boolean', default: false })
  managerCleared: boolean;

  @Column({ type: 'text', nullable: true })
  clearanceNotes?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

