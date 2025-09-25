import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
@Index('IDX_audit_entity', ['entityName', 'entityId'])
@Index('IDX_audit_actor', ['actorId'])
@Index('IDX_audit_action', ['action'])
@Index('IDX_audit_createdAt', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  actorId?: number | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  actorType?: string | null;

  @Column({ type: 'varchar', length: 80 })
  action: string;

  @Column({ type: 'varchar', length: 120 })
  entityName: string;

  @Column({ type: 'varchar', length: 64 })
  entityId: string;

  @Column({ type: 'json', nullable: true })
  changes?: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string | null;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ type: 'boolean', default: true })
  isSuccess: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

