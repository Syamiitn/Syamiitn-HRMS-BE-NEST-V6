import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum DocumentType {
  ID = 'id',
  CONTRACT = 'contract',
  CERTIFICATE = 'certificate',
  POLICY = 'policy',
  OTHER = 'other',
}

@Entity({ name: 'employee_documents' })
@Unique('UQ_employee_document_title_per_employee', ['employeeId', 'title'])
@Index('IDX_emp_doc_employeeId', ['employeeId'])
@Index('IDX_emp_doc_type', ['type'])
export class EmployeeDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.OTHER })
  type: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'varchar', length: 127 })
  mimeType: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  size: number;

  @Column({ type: 'date', nullable: true })
  issueDate?: string | null;

  @Column({ type: 'date', nullable: true })
  expiryDate?: string | null;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

