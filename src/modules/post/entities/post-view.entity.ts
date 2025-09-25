import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'post_views' })
@Unique('UQ_post_view', ['postId', 'userId'])
@Index('IDX_post_view_postId', ['postId'])
@Index('IDX_post_view_userId', ['userId'])
export class PostView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  postId: string;

  @Column({ type: 'int' })
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

