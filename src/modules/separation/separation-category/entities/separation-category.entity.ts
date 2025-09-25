import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'separation_category' })
@Unique('UQ_separation_category_code', ['code'])
@Index('IDX_category_isActive', ['isActive'])
export class SeparationCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  code: string; // e.g., VOLUNTARY, INVOLUNTARY

  @Column({ type: 'varchar', length: 100 })
  label: string; // e.g., Voluntary Separation

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

