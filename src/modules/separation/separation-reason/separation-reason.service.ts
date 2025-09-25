import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Like, Repository } from 'typeorm';
import { SeparationReason } from './entities/separation-reason.entity';
import { CreateSeparationReasonDto } from './dto/create-separation-reason.dto';
import { UpdateSeparationReasonDto } from './dto/update-separation-reason.dto';
import { QuerySeparationReasonDto } from './dto/query-separation-reason.dto';

@Injectable()
export class SeparationReasonService {
  constructor(
    @InjectRepository(SeparationReason)
    private readonly repo: Repository<SeparationReason>,
  ) {}

  private async assertUniqueName(name: string, excludeId?: string) {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Separation reason name already exists');
    }
  }

  async create(dto: CreateSeparationReasonDto): Promise<SeparationReason> {
    await this.assertUniqueName(dto.name);
    const entity = this.repo.create({ ...(dto as any) } as DeepPartial<SeparationReason>);
    return this.repo.save(entity);
  }

  async findAll(query: QuerySeparationReasonDto): Promise<SeparationReason[]> {
    const base: any = {};
    const where: any[] = [];
    if (typeof query.isActive === 'boolean') base.isActive = query.isActive;
    if (query.tenantId) base.tenantId = query.tenantId;
    if (query.search) {
      const term = `%${query.search}%`;
      where.push({ name: Like(term) });
      where.push({ description: Like(term) });
    }
    const orderByField = query.sortBy ?? 'createdAt';
    const orderByDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;
    const options: any = {
      where: where.length ? where.map((w) => ({ ...w, ...base })) : base,
      order: { [orderByField]: orderByDir },
    };
    if (query.page && query.limit) {
      options.skip = (query.page - 1) * query.limit;
      options.take = query.limit;
    }
    return this.repo.find(options);
  }

  async findOne(id: string): Promise<SeparationReason> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Separation reason not found');
    return entity;
  }

  async update(id: string, dto: UpdateSeparationReasonDto): Promise<SeparationReason> {
    if (dto.name) await this.assertUniqueName(dto.name, id);
    const entity = await this.repo.preload({ id, ...(dto as any) } as DeepPartial<SeparationReason>);
    if (!entity) throw new NotFoundException('Separation reason not found');
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Separation reason not found');
  }
}

