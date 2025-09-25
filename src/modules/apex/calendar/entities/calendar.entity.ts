import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'calendars' })
@Unique('UQ_calendar_name', ['name'])
@Unique('UQ_calendar_code', ['code'])
@Index('IDX_calendar_isActive', ['isActive'])
@Index('IDX_calendar_timezone', ['timezone'])
@Index('IDX_calendar_country', ['country'])
@Index('IDX_calendar_effectiveFrom', ['effectiveFrom'])
export class Calendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 64 })
  timezone: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  region?: string | null;

  @Column({ type: 'date' })
  effectiveFrom: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  effectiveTo?: string | null;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

