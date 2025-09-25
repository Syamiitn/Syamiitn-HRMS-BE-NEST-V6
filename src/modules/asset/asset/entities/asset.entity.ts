import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AssetStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

@Entity({ name: 'assets' })
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  assetTag: string;

  @Column({ type: 'varchar', length: 80 })
  category: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @Column({ type: 'varchar', length: 120, nullable: true, unique: true })
  serialNumber?: string | null;

  @Column({ type: 'date', nullable: true })
  purchaseDate?: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  purchaseCost?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  location?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  vendor?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

