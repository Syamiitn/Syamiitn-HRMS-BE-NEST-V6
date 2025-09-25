import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Like, Repository } from 'typeorm';
import { SeparationCategory } from './entities/separation-category.entity';
import { CreateSeparationCategoryDto } from './dto/create-separation-category.dto';
import { UpdateSeparationCategoryDto } from './dto/update-separation-category.dto';
import { QuerySeparationCategoryDto } from './dto/query-separation-category.dto';

@Injectable()
export class SeparationCategoryService {
  constructor(
    @InjectRepository(SeparationCategory)
    private readonly repo: Repository<SeparationCategory>,
  ) {}

  private async ensureUniqueCode(code: string, excludeId?: string) {
    const existing = await this.repo.findOne({ where: { code } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Category code already exists');
    }
  }

  async create(dto: CreateSeparationCategoryDto): Promise<SeparationCategory> {
    await this.ensureUniqueCode(dto.code);
    const entity = this.repo.create({ ...(dto as any) } as DeepPartial<SeparationCategory>);
    return this.repo.save(entity);
  }

  async findAll(query: QuerySeparationCategoryDto): Promise<SeparationCategory[]> {
    const base: any = {};
    const where: any[] = [];
    if (typeof query.isActive === 'boolean') base.isActive = query.isActive;
    if (query.search) {
      const term = `%${query.search}%`;
      where.push({ label: Like(term) });
      where.push({ code: Like(term) });
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

  async findOne(id: string): Promise<SeparationCategory> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Separation category not found');
    return entity;
  }

  async update(id: string, dto: UpdateSeparationCategoryDto): Promise<SeparationCategory> {
    if (dto.code) await this.ensureUniqueCode(dto.code, id);
    const entity = await this.repo.preload({ id, ...(dto as any) } as DeepPartial<SeparationCategory>);
    if (!entity) throw new NotFoundException('Separation category not found');
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Separation category not found');
  }
}

