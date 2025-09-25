import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../apex/user/entities/user.entity';

export enum OtpChannel {
  EMAIL = 'email',
  SMS = 'sms',
  ALL = 'all',
}

export enum OtpPurpose {
  LOGIN = 'login',
  ENABLE_2FA = 'enable_2fa',
  RESET_PASSWORD = 'reset_password',
}

@Entity({ name: 'otp_codes' })
@Index('IDX_otp_userId', ['userId'])
@Index('IDX_otp_purpose', ['purpose'])
@Index('IDX_otp_expiresAt', ['expiresAt'])
export class OtpCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  userId?: number | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User | null;

  @Column({ type: 'enum', enum: OtpChannel })
  channel: OtpChannel;

  @Column({ type: 'varchar', length: 160 })
  destination: string; // email or phone number

  @Column({ type: 'varchar', length: 255 })
  codeHash: string;

  @Column({ type: 'enum', enum: OtpPurpose })
  purpose: OtpPurpose;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  consumedAt?: Date | null;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
