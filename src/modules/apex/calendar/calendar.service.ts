import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { Calendar } from './entities/calendar.entity';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { QueryCalendarDto } from './dto/query-calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private readonly repo: Repository<Calendar>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private validateDates(fromStr?: string, toStr?: string) {
    const from = this.toDate(fromStr);
    if (!from || isNaN(from.getTime())) throw new BadRequestException('Invalid effectiveFrom');
    if (toStr) {
      const to = this.toDate(toStr)!;
      if (isNaN(to.getTime())) throw new BadRequestException('Invalid effectiveTo');
      if (to < from) throw new BadRequestException('effectiveTo cannot be before effectiveFrom');
    }
  }

  private async ensureUniqueFields(dto: { name?: string; code?: string }, excludeId?: number) {
    if (dto.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Calendar name already exists');
      }
    }
    if (dto.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Calendar code already exists');
      }
    }
  }

  async create(dto: CreateCalendarDto): Promise<any> {
    try {
      this.validateDates(dto.effectiveFrom, dto.effectiveTo);
      await this.ensureUniqueFields({ name: dto.name, code: dto.code });
      const entity = this.repo.create(dto as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate calendar detected');
      throw new InternalServerErrorException('Failed to create calendar');
    }
  }

  async findAll(query: QueryCalendarDto = {} as QueryCalendarDto): Promise<Calendar[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ code: Like(term) });
        where.push({ description: Like(term) });
        where.push({ region: Like(term) });
      }

      const baseWhere: any = {};
      if (query.timezone) baseWhere.timezone = query.timezone;
      if (query.country) baseWhere.country = query.country;
      if (query.region) baseWhere.region = query.region;
      if (typeof query.isDefault === 'boolean') baseWhere.isDefault = query.isDefault;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.effectiveFromFrom || query.effectiveFromTo) {
        const from = query.effectiveFromFrom ?? '0001-01-01';
        const to = query.effectiveFromTo ?? '9999-12-31';
        baseWhere.effectiveFrom = Between(from, to);
      }
      if (query.effectiveToFrom || query.effectiveToTo) {
        const from = query.effectiveToFrom ?? '0001-01-01';
        const to = query.effectiveToTo ?? '9999-12-31';
        baseWhere.effectiveTo = Between(from, to);
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
      throw new InternalServerErrorException('Failed to fetch calendars');
    }
  }

  async findOne(id: number): Promise<Calendar> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Calendar not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch calendar');
    }
  }

  async update(id: number, dto: UpdateCalendarDto): Promise<Calendar> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Calendar not found');

      const effectiveFrom = dto.effectiveFrom ?? current.effectiveFrom;
      const effectiveTo = dto.effectiveTo ?? current.effectiveTo ?? undefined;
      this.validateDates(effectiveFrom, effectiveTo as any);

      if (dto.name || dto.code) {
        await this.ensureUniqueFields({ name: dto.name, code: dto.code }, id);
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        effectiveFrom,
        effectiveTo: (effectiveTo as any) ?? current.effectiveTo,
      } as any);
      if (!updated) throw new NotFoundException('Calendar not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate calendar detected');
      throw new InternalServerErrorException('Failed to update calendar');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Calendar not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete calendar');
    }
  }
}

