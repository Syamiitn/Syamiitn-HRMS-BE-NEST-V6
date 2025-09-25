import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

export enum AccountType {
  SAVINGS = 'savings',
  CURRENT = 'current',
  CHECKING = 'checking',
  SALARY = 'salary',
}

@Entity({ name: 'employee_bank_accounts' })
@Unique('UQ_employee_account_per_employee', ['employeeId', 'accountNumber'])
export class EmployeeBankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_employee_id')
  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'varchar', length: 120 })
  accountHolderName: string;

  @Column({ type: 'varchar', length: 120 })
  bankName: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  branchName?: string | null;

  // Allow alphanumerics (IBAN-friendly) 8-34 chars
  @Column({ type: 'varchar', length: 34 })
  accountNumber: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.SAVINGS })
  accountType: AccountType;

  // Country-specific codes are optional
  @Column({ type: 'varchar', length: 11, nullable: true })
  swiftCode?: string | null;

  @Column({ type: 'varchar', length: 11, nullable: true })
  ifsc?: string | null;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

