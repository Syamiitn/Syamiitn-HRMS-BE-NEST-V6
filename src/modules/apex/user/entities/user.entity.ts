import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../../employee/employee/entities/employee.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  USER = 'user',
}


@Entity({ name: 'users' })
@Unique('UQ_user_email', ['email'])
@Unique('UQ_user_username', ['username'])
@Unique('UQ_user_employee', ['employeeId'])
@Index('IDX_user_email', ['email'])
@Index('IDX_user_username', ['username'])
@Index('IDX_user_role', ['role'])
@Index('IDX_user_isActive', ['isActive'])
@Index('IDX_user_employee_id', ['employeeId'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  firstName: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  lastName?: string | null;

  @Column({ type: 'varchar', length: 40, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'enum', enum: ['email', 'sms','all'], nullable: true })
  twoFactorMethod?: 'email' | 'sms' | 'all' | null;

  // Optional one-to-one link to Employee
  @Column({ type: 'int', nullable: true })
  employeeId?: number | null;

  @OneToOne(() => Employee, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'employeeId' })
  employee?: Employee | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  tokenVersion: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
