import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'locations' })
@Unique('UQ_location_name', ['name'])
@Unique('UQ_location_code', ['code'])
@Index('IDX_location_city', ['city'])
@Index('IDX_location_country', ['country'])
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: true, unique: true })
  code?: string | null;

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
  country?: string | null; // ISO 2 or 3

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  email?: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

