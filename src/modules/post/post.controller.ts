import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post as HttpPost,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../apex/user/entities/user.entity';

const maxBytes = Number(process.env.POST_MEDIA_MAX_BYTES ?? 25 * 1024 * 1024);

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PostController {
  constructor(private readonly service: PostService) {}

  @HttpPost()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() dto: CreatePostDto, @Req() req: any) {
    try {
      return await this.service.create(dto, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating post');
    }
  }

  @Get()
  async findAll(@Query() query: QueryPostDto, @Req() req: any) {
    try {
      return await this.service.findAll((req as any).user, query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching posts');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.service.findOne(id, (req as any).user, true);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching post');
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req: any) {
    try {
      return await this.service.update(id, dto, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating post');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string, @Req() req: any) {
    try {
      await this.service.remove(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting post');
    }
  }

  // Media upload (images/videos)
  @HttpPost(':id/media')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: maxBytes },
    }),
  )
  async uploadMedia(@Param('id') id: string, @UploadedFiles() files: any[], @Req() req: any) {
    if (!Array.isArray(files) || !files.length) throw new BadRequestException('files is required');
    try {
      const mapped = files.map((f) => ({ buffer: f.buffer, mimetype: f.mimetype, originalname: f.originalname }));
      return await this.service.uploadMedia(id, mapped, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error uploading media');
    }
  }

  // Comments
  @HttpPost(':id/comments')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE, UserRole.USER)
  async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @Req() req: any) {
    try {
      return await this.service.addComment(id, dto.content, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error adding comment');
    }
  }

  @Get(':id/comments')
  async listComments(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.service.listComments(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching comments');
    }
  }

  @Delete(':postId/comments/:commentId')
  @HttpCode(204)
  async removeComment(@Param('postId') postId: string, @Param('commentId') commentId: string, @Req() req: any) {
    try {
      await this.service.removeComment(postId, commentId, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting comment');
    }
  }

  // Likes
  @HttpPost(':id/like')
  async like(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.service.like(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error liking post');
    }
  }

  @Delete(':id/like')
  @HttpCode(204)
  async unlike(@Param('id') id: string, @Req() req: any) {
    try {
      await this.service.unlike(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error unliking post');
    }
  }
}

