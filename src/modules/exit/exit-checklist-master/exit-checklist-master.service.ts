import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ExitChecklistMaster } from './entities/exit-checklist-master.entity';
import { CreateExitChecklistMasterDto } from './dto/create-exit-checklist-master.dto';
import { UpdateExitChecklistMasterDto } from './dto/update-exit-checklist-master.dto';
import { QueryExitChecklistMasterDto } from './dto/query-exit-checklist-master.dto';

@Injectable()
export class ExitChecklistMasterService {
  constructor(
    @InjectRepository(ExitChecklistMaster)
    private readonly repo: Repository<ExitChecklistMaster>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private async ensureUniqueFields(dto: { name?: string; code?: string }, excludeId?: number) {
    if (dto.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Checklist name already exists');
      }
    }
    if (dto.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Checklist code already exists');
      }
    }
  }

  async create(dto: CreateExitChecklistMasterDto): Promise<any> {
    try {
      await this.ensureUniqueFields({ name: dto.name, code: dto.code });
      const entity = this.repo.create(dto as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate checklist detected');
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create checklist');
    }
  }

  async findAll(query: QueryExitChecklistMasterDto = {} as QueryExitChecklistMasterDto): Promise<ExitChecklistMaster[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ code: Like(term) });
        where.push({ description: Like(term) });
        where.push({ category: Like(term) });
      }

      const baseWhere: any = {};
      if (query.category) baseWhere.category = query.category;
      if (typeof query.isMandatory === 'boolean') baseWhere.isMandatory = query.isMandatory;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.defaultAssigneeId) baseWhere.defaultAssigneeId = query.defaultAssigneeId;

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
      throw new InternalServerErrorException('Failed to fetch checklists');
    }
  }

  async findOne(id: number): Promise<ExitChecklistMaster> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Checklist not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch checklist');
    }
  }

  async update(id: number, dto: UpdateExitChecklistMasterDto): Promise<ExitChecklistMaster> {
    try {
      if (dto.name || dto.code) {
        await this.ensureUniqueFields({ name: dto.name, code: dto.code }, id);
      }
      const updated = await this.repo.preload({ id, ...dto } as any);
      if (!updated) throw new NotFoundException('Checklist not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate checklist detected');
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update checklist');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Checklist not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete checklist');
    }
  }
}

