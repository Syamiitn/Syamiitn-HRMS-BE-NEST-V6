import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum SalaryComponentType {
  EARNING = 'earning',
  DEDUCTION = 'deduction',
}

export enum CalculationMethod {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FORMULA = 'formula',
}

@Entity({ name: 'salary_components' })
@Unique('UQ_salary_component_name', ['name'])
@Unique('UQ_salary_component_code', ['code'])
@Index('IDX_salary_component_type', ['type'])
@Index('IDX_salary_component_active', ['isActive'])
@Index('IDX_salary_component_sequence', ['sequence'])
export class SalaryComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: SalaryComponentType, default: SalaryComponentType.EARNING })
  type: SalaryComponentType;

  @Column({ type: 'enum', enum: CalculationMethod, default: CalculationMethod.FIXED })
  calculationMethod: CalculationMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: string; // used when FIXED

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage: string; // used when PERCENTAGE (0-100)

  @Column({ type: 'varchar', length: 1000, nullable: true })
  formula?: string | null; // used when FORMULA

  @Column({ type: 'boolean', default: true })
  taxable: boolean;

  @Column({ type: 'boolean', default: true })
  preTax: boolean; // if deduction, whether pre-tax

  @Column({ type: 'varchar', length: 255, nullable: true })
  dependsOnCodes?: string | null; // comma-separated component codes

  @Column({ type: 'int', unsigned: true, default: 0 })
  sequence: number; // ordering in payroll

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

