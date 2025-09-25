import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { Designation } from './entities/designation.entity';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { QueryDesignationDto } from './dto/query-designation.dto';

@Injectable()
export class DesignationService {
  constructor(
    @InjectRepository(Designation)
    private readonly repo: Repository<Designation>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private async ensureUniqueFields(dto: { name?: string; code?: string }, excludeId?: number) {
    if (dto.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Designation name already exists');
      }
    }
    if (dto.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Designation code already exists');
      }
    }
  }

  async create(dto: CreateDesignationDto): Promise<any> {
    try {
      await this.ensureUniqueFields({ name: dto.name, code: dto.code });
      const entity = this.repo.create({
        ...dto,
        level: dto.level ?? 1,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate designation detected');
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create designation');
    }
  }

  async findAll(query: QueryDesignationDto = {} as QueryDesignationDto): Promise<Designation[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ code: Like(term) });
        where.push({ description: Like(term) });
      }

      const baseWhere: any = {};
      if (query.departmentId) baseWhere.departmentId = query.departmentId;
      if (typeof query.isManagerial === 'boolean') baseWhere.isManagerial = query.isManagerial;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.minLevel !== undefined || query.maxLevel !== undefined) {
        const min = query.minLevel ?? 1;
        const max = query.maxLevel ?? 10_000;
        baseWhere.level = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch designations');
    }
  }

  async findOne(id: number): Promise<Designation> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Designation not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch designation');
    }
  }

  async update(id: number, dto: UpdateDesignationDto): Promise<Designation> {
    try {
      if (dto.name || dto.code) {
        await this.ensureUniqueFields({ name: dto.name, code: dto.code }, id);
      }
      const updated = await this.repo.preload({ id, ...dto } as any);
      if (!updated) throw new NotFoundException('Designation not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate designation detected');
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update designation');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Designation not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete designation');
    }
  }
}

