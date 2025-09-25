import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateCategory {
  EMAIL = 'Email',
  SMS = 'SMS',
  OTP = 'OTP',
  DOCUMENT = 'Document',
  OTHER = 'Other',
}

export enum TemplateFormat {
  TEXT = 'text',
  HTML = 'html',
  MARKDOWN = 'markdown',
}

@Entity({ name: 'templates' })
@Unique('UQ_template_code', ['code'])
@Index('IDX_template_category', ['category'])
@Index('IDX_template_owner', ['ownerUserId'])
@Index('IDX_template_isActive', ['isActive'])
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'varchar', length: 60 })
  code: string;

  @Column({ type: 'enum', enum: TemplateCategory })
  category: TemplateCategory;

  @Column({ type: 'enum', enum: TemplateFormat, default: TemplateFormat.TEXT })
  format: TemplateFormat;

  @Column({ type: 'text' })
  content: string; // template body with placeholders {{var}}

  @Column({ type: 'json', nullable: true })
  tags?: string[] | null;

  @Column({ type: 'json', nullable: true })
  requiredPlaceholders?: string[] | null; // custom required placeholders

  @Column({ type: 'int', nullable: true })
  ownerUserId?: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

