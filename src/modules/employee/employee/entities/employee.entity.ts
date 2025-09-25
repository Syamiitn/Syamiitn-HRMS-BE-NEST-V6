import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  PROBATION = 'probation',
  RESIGNED = 'resigned',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Entity({ name: 'employees' })
@Unique('UQ_employee_email', ['email'])
@Unique('UQ_employee_code', ['employeeCode'])
@Index('IDX_employee_status', ['status'])
@Index('IDX_employee_department', ['departmentId'])
@Index('IDX_employee_manager', ['managerId'])
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  firstName: string;

  @Column({ type: 'varchar', length: 120 })
  lastName: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  middleName?: string | null;

  @Column({ type: 'varchar', length: 40, unique: true })
  employeeCode: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender | null;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  @Column({ type: 'date' })
  hireDate: string; // YYYY-MM-DD

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  departmentId?: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  designation?: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  managerId?: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine1?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  state?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string | null;

  @Column({ type: 'varchar', length: 3, nullable: true })
  country?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

