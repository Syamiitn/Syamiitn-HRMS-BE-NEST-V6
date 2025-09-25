import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostLike } from './entities/post-like.entity';
import { PostView } from './entities/post-view.entity';
import { MediaStorageService } from './media/media-storage.service';
import { PostNotificationService } from './notification/post-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostComment, PostLike, PostView])],
  controllers: [PostController],
  providers: [PostService, MediaStorageService, PostNotificationService],
  exports: [TypeOrmModule],
})
export class PostModule {}

