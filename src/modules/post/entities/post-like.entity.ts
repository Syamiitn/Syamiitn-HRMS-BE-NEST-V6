import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'post_likes' })
@Unique('UQ_post_like', ['postId', 'userId'])
@Index('IDX_post_like_postId', ['postId'])
@Index('IDX_post_like_userId', ['userId'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  postId: string;

  @ManyToOne(() => Post, (p) => p.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post?: Post;

  @Column({ type: 'int' })
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

