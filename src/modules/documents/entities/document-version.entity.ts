import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity({ name: 'document_versions' })
@Index('UQ_doc_version', ['documentId', 'version'], { unique: true })
@Index('IDX_doc_version_createdAt', ['createdAt'])
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  documentId: string;

  @ManyToOne(() => Document, (d) => d.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document?: Document;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'varchar', length: 120 })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: string;

  @Column({ type: 'varchar', length: 512 })
  storageKey: string; // path or cloud key

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum?: string | null; // e.g., sha256

  @Column({ type: 'int', nullable: true })
  createdByUserId?: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

