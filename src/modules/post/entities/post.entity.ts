import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostComment } from './post-comment.entity';
import { PostLike } from './post-like.entity';

export enum PostType {
  ALERT = 'alert',
  NOTIFICATION = 'notification',
  ANNOUNCEMENT = 'announcement',
  UPDATE = 'update',
}

@Entity({ name: 'posts' })
@Index('IDX_post_type', ['type'])
@Index('IDX_post_author', ['authorUserId'])
@Index('IDX_post_createdAt', ['createdAt'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: PostType })
  type: PostType;

  @Column({ type: 'int' })
  authorUserId: number;

  @Column({ type: 'json', nullable: true })
  mediaUrls?: string[] | null; // public URLs (s3 or served paths)

  @Column({ type: 'json', nullable: true })
  mediaKeys?: string[] | null; // storage keys for deletion

  @Column({ type: 'json', nullable: true })
  departmentIds?: number[] | null; // visibility scope by departments

  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  commentsCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => PostComment, (c) => c.post)
  comments?: PostComment[];

  @OneToMany(() => PostLike, (l) => l.post)
  likes?: PostLike[];
}

