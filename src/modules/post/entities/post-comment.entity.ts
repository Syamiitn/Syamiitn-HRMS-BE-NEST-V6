import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'post_comments' })
@Index('IDX_post_comment_postId', ['postId'])
@Index('IDX_post_comment_userId', ['userId'])
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  postId: string;

  @ManyToOne(() => Post, (p) => p.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post?: Post;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

