import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentVersion } from './document-version.entity';

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
}

@Entity({ name: 'documents' })
@Index('IDX_doc_owner', ['ownerUserId'])
@Index('IDX_doc_isActive', ['isActive'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'varchar', length: 120 })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: string; // store as string for bigints

  @Column({ type: 'int', nullable: true })
  ownerUserId?: number | null;

  @Column({ type: 'enum', enum: StorageProvider, default: StorageProvider.LOCAL })
  storageProvider: StorageProvider;

  @Column({ type: 'int', default: 1 })
  currentVersion: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => DocumentVersion, (v) => v.document)
  versions?: DocumentVersion[];
}

