import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'revoked_tokens' })
@Index('IDX_revoked_jti', ['jti'], { unique: true })
@Index('IDX_revoked_expiresAt', ['expiresAt'])
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  jti: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

