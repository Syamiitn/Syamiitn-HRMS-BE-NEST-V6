import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly repo: Repository<Shift>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private parseTime(t?: string): { h: number; m: number; s: number } {
    if (!t) throw new BadRequestException('Time is required');
    const m = /^([0-1]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(t);
    if (!m) throw new BadRequestException('Invalid time format, expected HH:MM[:SS]');
    return { h: parseInt(m[1], 10), m: parseInt(m[2], 10), s: parseInt(m[3] || '0', 10) };
  }

  private computeDurationMinutes(startTime: string, endTime: string, crossMidnight = false, breakMinutes = 0): number {
    const a = this.parseTime(startTime);
    const b = this.parseTime(endTime);
    const start = a.h * 60 + a.m + Math.floor(a.s / 60);
    let end = b.h * 60 + b.m + Math.floor(b.s / 60);
    if (crossMidnight) {
      // add 24h to end if it is on the next day
      if (end <= start) end += 24 * 60;
    } else {
      if (end <= start) throw new BadRequestException('endTime must be after startTime unless crossMidnight is true');
    }
    const raw = end - start;
    if (breakMinutes < 0) throw new BadRequestException('breakMinutes cannot be negative');
    const total = raw - breakMinutes;
    if (total <= 0) throw new BadRequestException('Total minutes must be greater than zero after breaks');
    return total;
  }

  private async ensureUniqueFields(dto: { name?: string; code?: string }, excludeId?: number) {
    if (dto.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Shift name already exists');
      }
    }
    if (dto.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Shift code already exists');
      }
    }
  }

  async create(dto: CreateShiftDto): Promise<any> {
    try {
      await this.ensureUniqueFields({ name: dto.name, code: dto.code });
      const totalMinutes = this.computeDurationMinutes(
        dto.startTime,
        dto.endTime,
        dto.crossMidnight ?? false,
        dto.breakMinutes ?? 0,
      );
      const entity = this.repo.create({
        ...dto,
        totalMinutes,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate shift detected');
      throw new InternalServerErrorException('Failed to create shift');
    }
  }

  async findAll(query: QueryShiftDto = {} as QueryShiftDto): Promise<Shift[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ code: Like(term) });
        where.push({ description: Like(term) });
        where.push({ timezone: Like(term) });
      }

      const baseWhere: any = {};
      if (query.timezone) baseWhere.timezone = query.timezone;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.minTotalMinutes !== undefined || query.maxTotalMinutes !== undefined) {
        const min = query.minTotalMinutes ?? 0;
        const max = query.maxTotalMinutes ?? 24 * 60;
        baseWhere.totalMinutes = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch shifts');
    }
  }

  async findOne(id: number): Promise<Shift> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Shift not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch shift');
    }
  }

  async update(id: number, dto: UpdateShiftDto): Promise<Shift> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Shift not found');

      if (dto.name || dto.code) {
        await this.ensureUniqueFields({ name: dto.name, code: dto.code }, id);
      }

      const startTime = dto.startTime ?? current.startTime;
      const endTime = dto.endTime ?? current.endTime;
      const crossMidnight = dto.crossMidnight ?? current.crossMidnight;
      const breakMinutes = dto.breakMinutes ?? current.breakMinutes;
      const totalMinutes = this.computeDurationMinutes(startTime, endTime, crossMidnight, breakMinutes);

      const updated = await this.repo.preload({
        id,
        ...dto,
        startTime,
        endTime,
        crossMidnight,
        breakMinutes,
        totalMinutes,
      } as any);
      if (!updated) throw new NotFoundException('Shift not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate shift detected');
      throw new InternalServerErrorException('Failed to update shift');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Shift not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete shift');
    }
  }
}

