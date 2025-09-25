import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { QueryLocationDto } from './dto/query-location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private async ensureUniqueFields(dto: { name?: string; code?: string }, excludeId?: number) {
    if (dto.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Location name already exists');
      }
    }
    if (dto.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Location code already exists');
      }
    }
  }

  async create(dto: CreateLocationDto): Promise<any> {
    try {
      await this.ensureUniqueFields({ name: dto.name, code: dto.code });
      const entity = this.repo.create(dto as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate location detected');
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create location');
    }
  }

  async findAll(query: QueryLocationDto = {} as QueryLocationDto): Promise<Location[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ code: Like(term) });
        where.push({ city: Like(term) });
        where.push({ state: Like(term) });
      }

      const baseWhere: any = {};
      if (query.city) baseWhere.city = query.city;
      if (query.state) baseWhere.state = query.state;
      if (query.country) baseWhere.country = query.country;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;

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
      throw new InternalServerErrorException('Failed to fetch locations');
    }
  }

  async findOne(id: number): Promise<Location> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Location not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch location');
    }
  }

  async update(id: number, dto: UpdateLocationDto): Promise<Location> {
    try {
      if (dto.name || dto.code) {
        await this.ensureUniqueFields({ name: dto.name, code: dto.code }, id);
      }
      const updated = await this.repo.preload({ id, ...dto } as any);
      if (!updated) throw new NotFoundException('Location not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate location detected');
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update location');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Location not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete location');
    }
  }
}

