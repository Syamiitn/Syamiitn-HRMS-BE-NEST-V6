import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum StatutoryIdType {
  PAN = 'pan',
  AADHAAR = 'aadhaar',
  SSN = 'ssn',
  NIN = 'nin',
  TAX = 'tax',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  OTHER = 'other',
}

@Entity({ name: 'employee_statutory_ids' })
@Unique('UQ_employee_idtype_per_employee', ['employeeId', 'type'])
@Unique('UQ_employee_statutory_idNumber', ['idNumber'])
@Index('IDX_emp_stat_id_employee', ['employeeId'])
@Index('IDX_emp_stat_id_type', ['type'])
@Index('IDX_emp_stat_id_country', ['country'])
export class EmployeeStatutoryId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'enum', enum: StatutoryIdType, default: StatutoryIdType.OTHER })
  type: StatutoryIdType;

  @Column({ type: 'varchar', length: 80, unique: true })
  idNumber: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  issuedBy?: string | null;

  @Column({ type: 'date', nullable: true })
  issueDate?: string | null;

  @Column({ type: 'date', nullable: true })
  expiryDate?: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country?: string | null; // ISO 2 or 3

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

