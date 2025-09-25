import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { Holiday, HolidayType } from './entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { QueryHolidayDto } from './dto/query-holiday.dto';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly repo: Repository<Holiday>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private async ensureUnique(date: string, name: string, excludeId?: number) {
    const existing = await this.repo.findOne({ where: { date, name } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('A holiday with this name already exists on the given date');
    }
  }

  async create(dto: CreateHolidayDto): Promise<any> {
    try {
      await this.ensureUnique(dto.date, dto.name);
      const entity = this.repo.create({
        ...dto,
        type: dto.type ?? HolidayType.PUBLIC,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate holiday detected');
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create holiday');
    }
  }

  async findAll(query: QueryHolidayDto = {} as QueryHolidayDto): Promise<Holiday[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ description: Like(term) });
        where.push({ city: Like(term) });
        where.push({ state: Like(term) });
      }

      const baseWhere: any = {};
      if (query.type) baseWhere.type = query.type;
      if (query.country) baseWhere.country = query.country;
      if (query.state) baseWhere.state = query.state;
      if (query.city) baseWhere.city = query.city;
      if (typeof query.isRecurring === 'boolean') baseWhere.isRecurring = query.isRecurring;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.dateFrom || query.dateTo) {
        const from = query.dateFrom ?? '0001-01-01';
        const to = query.dateTo ?? '9999-12-31';
        baseWhere.date = Between(from, to);
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
      throw new InternalServerErrorException('Failed to fetch holidays');
    }
  }

  async findOne(id: number): Promise<Holiday> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Holiday not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch holiday');
    }
  }

  async update(id: number, dto: UpdateHolidayDto): Promise<Holiday> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Holiday not found');

      const date = dto.date ?? current.date;
      const name = dto.name ?? current.name;
      if (dto.date || dto.name) {
        await this.ensureUnique(date, name, id);
      }

      const updated = await this.repo.preload({ id, ...dto, date, name } as any);
      if (!updated) throw new NotFoundException('Holiday not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate holiday detected');
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update holiday');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Holiday not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete holiday');
    }
  }
}

