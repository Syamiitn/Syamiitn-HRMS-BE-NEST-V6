import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { AttendanceTimeEntry, TimeEntrySource, TimeEntryType } from './entities/attendance-time-entry.entity';
import { CreateAttendanceTimeEntryDto } from './dto/create-attendance-time-entry.dto';
import { UpdateAttendanceTimeEntryDto } from './dto/update-attendance-time-entry.dto';
import { QueryAttendanceTimeEntryDto } from './dto/query-attendance-time-entry.dto';

@Injectable()
export class AttendanceTimeEntryService {
  constructor(
    @InjectRepository(AttendanceTimeEntry)
    private readonly repo: Repository<AttendanceTimeEntry>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private parseTime(t?: string | null): { h: number; m: number; s: number } | null {
    if (!t) return null;
    const m = /^([0-1]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(t);
    if (!m) throw new BadRequestException('Invalid time format, expected HH:MM[:SS]');
    return { h: parseInt(m[1], 10), m: parseInt(m[2], 10), s: parseInt(m[3] || '0', 10) };
  }

  private minutesBetween(start: string, end: string): number {
    const a = this.parseTime(start)!;
    const b = this.parseTime(end)!;
    const startMin = a.h * 60 + a.m + Math.floor(a.s / 60);
    const endMin = b.h * 60 + b.m + Math.floor(b.s / 60);
    if (endMin < startMin) throw new BadRequestException('endTime cannot be before startTime');
    return endMin - startMin;
  }

  private async ensureNoOverlap(employeeId: number, date: string, start: string, end: string, excludeId?: number) {
    const qb = this.repo
      .createQueryBuilder('e')
      .where('e.employeeId = :employeeId', { employeeId })
      .andWhere('e.date = :date', { date })
      .andWhere('e.startTime < :end AND e.endTime > :start', { start, end });
    if (excludeId) qb.andWhere('e.id != :excludeId', { excludeId });
    const conflict = await qb.getOne();
    if (conflict) throw new ConflictException('Overlapping time entry exists for this employee and date');
  }

  private normalize(dto: Partial<AttendanceTimeEntry>) {
    return {
      type: (dto.type as any) ?? TimeEntryType.WORK,
      source: (dto.source as any) ?? TimeEntrySource.MANUAL,
    };
  }

  async create(dto: CreateAttendanceTimeEntryDto): Promise<any> {
    try {
      // Validate date
      const d = this.toDate(dto.date);
      if (!d || isNaN(d.getTime())) throw new BadRequestException('Invalid date');
      // Validate times and duration
      const duration = this.minutesBetween(dto.startTime, dto.endTime);
      await this.ensureNoOverlap(dto.employeeId, dto.date, dto.startTime, dto.endTime);

      const { type, source } = this.normalize({ type: dto.type as any, source: dto.source as any });

      const entity = this.repo.create({
        ...dto,
        type,
        source,
        durationMinutes: duration,
      } as any);
      return await this.repo.save(entity);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create attendance time entry');
    }
  }

  async findAll(query: QueryAttendanceTimeEntryDto = {} as QueryAttendanceTimeEntryDto): Promise<AttendanceTimeEntry[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ notes: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.type) baseWhere.type = query.type;
      if (query.source) baseWhere.source = query.source;
      if (typeof query.isApproved === 'boolean') baseWhere.isApproved = query.isApproved;
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
      throw new InternalServerErrorException('Failed to fetch attendance time entries');
    }
  }

  async findOne(id: number): Promise<AttendanceTimeEntry> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Attendance time entry not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch attendance time entry');
    }
  }

  async update(id: number, dto: UpdateAttendanceTimeEntryDto): Promise<AttendanceTimeEntry> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Attendance time entry not found');

      const employeeId = dto.employeeId ?? current.employeeId;
      const date = dto.date ?? current.date;
      const startTime = dto.startTime ?? current.startTime;
      const endTime = dto.endTime ?? current.endTime;

      // Revalidate date/time and overlap
      const d = this.toDate(date);
      if (!d || isNaN(d.getTime())) throw new BadRequestException('Invalid date');
      const duration = this.minutesBetween(startTime, endTime);
      await this.ensureNoOverlap(employeeId, date, startTime, endTime, id);

      const { type, source } = this.normalize({
        type: (dto.type as any) ?? (current.type as any),
        source: (dto.source as any) ?? (current.source as any),
      });

      const updated = await this.repo.preload({
        id,
        ...dto,
        employeeId,
        date,
        startTime,
        endTime,
        durationMinutes: duration,
        type,
        source,
      } as any);
      if (!updated) throw new NotFoundException('Attendance time entry not found');
      return await this.repo.save(updated);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      throw new InternalServerErrorException('Failed to update attendance time entry');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Attendance time entry not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete attendance time entry');
    }
  }
}

