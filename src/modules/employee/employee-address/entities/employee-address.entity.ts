import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AddressType {
  HOME = 'home',
  CURRENT = 'current',
  PERMANENT = 'permanent',
  WORK = 'work',
  OTHER = 'other',
}

@Entity({ name: 'employee_addresses' })
@Index('IDX_emp_addr_employee', ['employeeId'])
@Index('IDX_emp_addr_type', ['type'])
@Index('IDX_emp_addr_city', ['city'])
@Index('IDX_emp_addr_country', ['country'])
@Index('IDX_emp_addr_isPrimary', ['isPrimary'])
export class EmployeeAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.OTHER })
  type: AddressType;

  @Column({ type: 'varchar', length: 255 })
  line1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  line2?: string | null;

  @Column({ type: 'varchar', length: 120 })
  city: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  state?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country?: string | null; // ISO 2 or 3

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: string | null;

  @Column({ type: 'date', nullable: true })
  fromDate?: string | null;

  @Column({ type: 'date', nullable: true })
  toDate?: string | null;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

