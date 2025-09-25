import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Post, PostType } from './entities/post.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostLike } from './entities/post-like.entity';
import { PostView } from './entities/post-view.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { MediaStorageService } from './media/media-storage.service';
import { PostNotificationService } from './notification/post-notification.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(PostComment) private readonly commentRepo: Repository<PostComment>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
    @InjectRepository(PostView) private readonly viewRepo: Repository<PostView>,
    private readonly media: MediaStorageService,
    private readonly notifier: PostNotificationService,
  ) {}

  private ensurePublisher(actor: any) {
    const role = actor?.role;
    const ok = role === 'admin' || role === 'ADMIN' || role === 'Admin' || role === 'manager' || role === 'MANAGER' || role === 'hr' || role === 'HR';
    if (!ok) throw new ForbiddenException('Only HR, Admin, or Manager can publish');
  }

  private ensureOwnerOrPublisher(actor: any, p: Post) {
    const userId = actor?.sub;
    const role = actor?.role;
    const isPublisher = role === 'admin' || role === 'ADMIN' || role === 'Admin' || role === 'manager' || role === 'MANAGER' || role === 'hr' || role === 'HR';
    if (p.authorUserId !== userId && !isPublisher) throw new ForbiddenException('Insufficient permissions');
  }

  async create(dto: CreatePostDto, actor: any): Promise<Post> {
    this.ensurePublisher(actor);
    const entity = this.postRepo.create({
      ...dto,
      authorUserId: actor?.sub,
      mediaUrls: [],
      mediaKeys: [],
      isActive: true,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
    } as any);
    const saved = (await this.postRepo.save(entity as any)) as Post;
    // Trigger notifications for alerts/announcements
    if (saved.type === PostType.ALERT || saved.type === PostType.ANNOUNCEMENT) {
      try {
        await this.notifier.notifyNewPost({ id: saved.id, type: saved.type, title: saved.title }, []);
      } catch {}
    }
    return saved;
  }

  async findAll(actor: any, query: QueryPostDto): Promise<Post[]> {
    // Filter by department visibility; admins/managers see all
    const role = actor?.role;
    const isElevated = role === 'admin' || role === 'ADMIN' || role === 'Admin' || role === 'manager' || role === 'MANAGER' || role === 'hr' || role === 'HR';
    const deptId = actor?.departmentId ?? actor?.deptId ?? actor?.department?.id; // expect middleware to attach if available

    const qb = this.postRepo.createQueryBuilder('p');
    if (query.type) qb.andWhere('p.type = :type', { type: query.type });
    if (query.departmentId) {
      qb.andWhere('JSON_CONTAINS(p.departmentIds, JSON_ARRAY(:qdept)) = 1', { qdept: query.departmentId });
    }
    if (!isElevated && deptId) {
      qb.andWhere('JSON_CONTAINS(p.departmentIds, JSON_ARRAY(:dept)) = 1', { dept: deptId });
    }
    const orderBy = query.sortBy ?? 'createdAt';
    const orderDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;
    qb.orderBy(`p.${orderBy}`, orderDir);
    if (query.page && query.limit) qb.skip((query.page - 1) * query.limit).take(query.limit);
    return qb.getMany();
  }

  async findOne(id: string, actor: any, recordView = true): Promise<Post> {
    const p = await this.postRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Post not found');
    // Visibility enforcement for non-elevated users
    const role = actor?.role;
    const isElevated = role === 'admin' || role === 'ADMIN' || role === 'Admin' || role === 'manager' || role === 'MANAGER' || role === 'hr' || role === 'HR';
    const deptId = actor?.departmentId ?? actor?.deptId;
    if (!isElevated && deptId && Array.isArray(p.departmentIds) && !p.departmentIds.includes(deptId)) {
      throw new ForbiddenException('Not visible to your department');
    }
    if (recordView && actor?.sub) {
      try {
        const existing = await this.viewRepo.findOne({ where: { postId: id, userId: actor.sub } });
        if (!existing) {
          const v = this.viewRepo.create({ postId: id, userId: actor.sub } as any);
          await this.viewRepo.save(v);
          p.viewsCount += 1;
          await this.postRepo.save(p);
        }
      } catch {}
    }
    return p;
  }

  async update(id: string, dto: UpdatePostDto, actor: any): Promise<Post> {
    const p = await this.findOne(id, actor, false);
    this.ensureOwnerOrPublisher(actor, p);
    const updated = await this.postRepo.preload({ id, ...(dto as any) } as any);
    if (!updated) throw new NotFoundException('Post not found');
    return this.postRepo.save(updated);
  }

  async remove(id: string, actor: any): Promise<void> {
    const p = await this.findOne(id, actor, false);
    this.ensureOwnerOrPublisher(actor, p);
    // Remove associated media
    const keys = p.mediaKeys || [];
    for (const k of keys) { try { await this.media.remove(k); } catch {} }
    await this.postRepo.delete(id);
  }

  async uploadMedia(id: string, files: Array<{ buffer: Buffer; mimetype: string; originalname: string }>, actor: any) {
    const p = await this.findOne(id, actor, false);
    this.ensureOwnerOrPublisher(actor, p);
    const max = Number(process.env.POST_MEDIA_MAX_BYTES ?? 25 * 1024 * 1024);
    const allowed = (m: string) => m.startsWith('image/') || m.startsWith('video/');
    const urls = p.mediaUrls || [];
    const keys = p.mediaKeys || [];
    for (const f of files) {
      if (!allowed(f.mimetype)) throw new BadRequestException('Unsupported media type');
      if (!f.buffer || f.buffer.length === 0 || f.buffer.length > max) throw new BadRequestException('Invalid media size');
      const saved = await this.media.save(f.buffer, f.mimetype, f.originalname);
      urls.push(saved.url ?? saved.storageKey);
      keys.push(saved.storageKey);
    }
    p.mediaUrls = urls;
    p.mediaKeys = keys;
    await this.postRepo.save(p);
    return { mediaUrls: urls };
  }

  // Comments
  async addComment(postId: string, content: string, actor: any): Promise<PostComment> {
    const p = await this.findOne(postId, actor, false);
    const c = this.commentRepo.create({ postId, userId: actor?.sub, content, isActive: true } as any);
    const saved = await this.commentRepo.save(c);
    p.commentsCount += 1;
    await this.postRepo.save(p);
    return saved as any;
  }

  async listComments(postId: string, actor: any): Promise<PostComment[]> {
    await this.findOne(postId, actor, false);
    return this.commentRepo.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }

  async removeComment(postId: string, commentId: string, actor: any): Promise<void> {
    await this.findOne(postId, actor, false);
    const c = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!c) throw new NotFoundException('Comment not found');
    const isOwner = c.userId === actor?.sub;
    const role = actor?.role;
    const isElevated = role === 'admin' || role === 'ADMIN' || role === 'Admin' || role === 'manager' || role === 'MANAGER' || role === 'hr' || role === 'HR';
    if (!isOwner && !isElevated) throw new ForbiddenException('Insufficient permissions');
    await this.commentRepo.delete(commentId);
    try {
      const p = await this.postRepo.findOne({ where: { id: postId } });
      if (p && p.commentsCount > 0) { p.commentsCount -= 1; await this.postRepo.save(p); }
    } catch {}
  }

  // Likes
  async like(postId: string, actor: any): Promise<{ liked: boolean; likesCount: number }> {
    const p = await this.findOne(postId, actor, false);
    const existing = await this.likeRepo.findOne({ where: { postId, userId: actor?.sub } });
    if (existing) return { liked: true, likesCount: p.likesCount };
    const l = this.likeRepo.create({ postId, userId: actor?.sub } as any);
    await this.likeRepo.save(l);
    p.likesCount += 1;
    await this.postRepo.save(p);
    return { liked: true, likesCount: p.likesCount };
  }

  async unlike(postId: string, actor: any): Promise<{ liked: boolean; likesCount: number }> {
    const p = await this.findOne(postId, actor, false);
    const existing = await this.likeRepo.findOne({ where: { postId, userId: actor?.sub } });
    if (!existing) return { liked: false, likesCount: p.likesCount };
    await this.likeRepo.delete(existing.id);
    if (p.likesCount > 0) { p.likesCount -= 1; await this.postRepo.save(p); }
    return { liked: false, likesCount: p.likesCount };
  }
}
