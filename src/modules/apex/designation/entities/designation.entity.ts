import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'designations' })
@Unique('UQ_designation_name', ['name'])
@Unique('UQ_designation_code', ['code'])
@Index('IDX_designation_department', ['departmentId'])
@Index('IDX_designation_level', ['level'])
@Index('IDX_designation_isActive', ['isActive'])
export class Designation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'int', unsigned: true, default: 1 })
  level: number; // seniority level: higher means more senior

  @Column({ type: 'int', unsigned: true, nullable: true })
  departmentId?: number | null;

  @Column({ type: 'boolean', default: false })
  isManagerial: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

