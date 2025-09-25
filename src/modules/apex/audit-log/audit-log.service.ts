import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  async create(dto: CreateAuditLogDto): Promise<any> {
    try {
      const entity = this.repo.create(dto as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate audit log detected');
      throw new InternalServerErrorException('Failed to create audit log');
    }
  }

  async findAll(query: QueryAuditLogDto = {} as QueryAuditLogDto): Promise<AuditLog[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ message: Like(term) });
        where.push({ userAgent: Like(term) });
        where.push({ ipAddress: Like(term) });
      }

      const baseWhere: any = {};
      if (query.actorId) baseWhere.actorId = query.actorId;
      if (query.action) baseWhere.action = query.action;
      if (query.entityName) baseWhere.entityName = query.entityName;
      if (query.entityId) baseWhere.entityId = query.entityId;
      if (typeof query.isSuccess === 'boolean') baseWhere.isSuccess = query.isSuccess;
      if (query.createdFrom || query.createdTo) {
        const from = query.createdFrom ?? '0001-01-01';
        const to = query.createdTo ?? '9999-12-31';
        baseWhere.createdAt = Between(from as any, to as any);
      }

      const orderBy = query.sortBy ?? 'createdAt';
      const orderDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;

      const options: any = {
        where: where.length ? where.map((w) => ({ ...w, ...baseWhere })) : baseWhere,
        order: { [orderBy]: orderDir },
      };
      if (query.page && query.limit) {
        options.skip = (query.page - 1) * query.limit;
        options.take = query.limit;
      }

      return await this.repo.find(options);
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch audit logs');
    }
  }

  async findOne(id: number): Promise<AuditLog> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Audit log not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch audit log');
    }
  }

  async update(id: number, dto: UpdateAuditLogDto): Promise<AuditLog> {
    try {
      const updated = await this.repo.preload({ id, ...dto } as any);
      if (!updated) throw new NotFoundException('Audit log not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate audit log detected');
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update audit log');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Audit log not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete audit log');
    }
  }
}

