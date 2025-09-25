import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'shifts' })
@Unique('UQ_shift_name', ['name'])
@Unique('UQ_shift_code', ['code'])
@Index('IDX_shift_isActive', ['isActive'])
@Index('IDX_shift_timezone', ['timezone'])
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'time' })
  startTime: string; // HH:MM[:SS]

  @Column({ type: 'time' })
  endTime: string; // HH:MM[:SS]

  @Column({ type: 'boolean', default: false })
  crossMidnight: boolean;

  @Column({ type: 'int', unsigned: true, default: 0 })
  breakMinutes: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  totalMinutes: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  graceLateMinutes: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  graceEarlyMinutes: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

