import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

export enum HolidayType {
  PUBLIC = 'public',
  COMPANY = 'company',
  OPTIONAL = 'optional',
  BANK = 'bank',
}

@Entity({ name: 'holidays' })
@Unique('UQ_holiday_date_name', ['date', 'name'])
@Index('IDX_holiday_date', ['date'])
@Index('IDX_holiday_type', ['type'])
@Index('IDX_holiday_country', ['country'])
export class Holiday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: HolidayType, default: HolidayType.PUBLIC })
  type: HolidayType;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  state?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

