import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { AttendanceDay, AttendanceStatus } from './entities/attendance-day.entity';
import { CreateAttendanceDayDto } from './dto/create-attendance-day.dto';
import { UpdateAttendanceDayDto } from './dto/update-attendance-day.dto';
import { QueryAttendanceDayDto } from './dto/query-attendance-day.dto';

@Injectable()
export class AttendanceDayService {
  constructor(
    @InjectRepository(AttendanceDay)
    private readonly repo: Repository<AttendanceDay>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private parseTime(t?: string | null): { h: number; m: number } | null {
    if (!t) return null;
    const m = /^([0-1]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(t);
    if (!m) throw new BadRequestException('Invalid time format, expected HH:MM[:SS]');
    return { h: parseInt(m[1], 10), m: parseInt(m[2], 10) };
  }

  private minutesBetween(checkIn?: string | null, checkOut?: string | null): number | null {
    const a = this.parseTime(checkIn);
    const b = this.parseTime(checkOut);
    if (!a || !b) return null;
    const start = a.h * 60 + a.m;
    const end = b.h * 60 + b.m;
    if (end < start) throw new BadRequestException('checkOutTime cannot be before checkInTime');
    return end - start;
  }

  private async ensureUnique(employeeId: number, date: string, excludeId?: number) {
    const existing = await this.repo.findOne({ where: { employeeId, date } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Attendance already recorded for this employee and date');
    }
  }

  private normalizeStatus(status?: AttendanceStatus): AttendanceStatus {
    return status ?? AttendanceStatus.PRESENT;
  }

  async create(dto: CreateAttendanceDayDto): Promise<any> {
    try {
      // Validate date
      const d = this.toDate(dto.date);
      if (!d || isNaN(d.getTime())) throw new BadRequestException('Invalid date');

      await this.ensureUnique(dto.employeeId, dto.date);

      const status = this.normalizeStatus(dto.status);

      let workedMinutes = dto.workedMinutes ?? 0;
      const computed = this.minutesBetween(dto.checkInTime ?? null, dto.checkOutTime ?? null);
      if (computed !== null) workedMinutes = computed;
      if (workedMinutes < 0) throw new BadRequestException('workedMinutes cannot be negative');

      const entity = this.repo.create({
        ...dto,
        status,
        workedMinutes,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate attendance detected');
      throw new InternalServerErrorException('Failed to create attendance');
    }
  }

  async findAll(query: QueryAttendanceDayDto = {} as QueryAttendanceDayDto): Promise<AttendanceDay[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ remarks: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.status) baseWhere.status = query.status;
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
      throw new InternalServerErrorException('Failed to fetch attendance');
    }
  }

  async findOne(id: number): Promise<AttendanceDay> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Attendance not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch attendance');
    }
  }

  async update(id: number, dto: UpdateAttendanceDayDto): Promise<AttendanceDay> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Attendance not found');

      const employeeId = dto.employeeId ?? current.employeeId;
      const date = dto.date ?? current.date;
      if (dto.employeeId || dto.date) {
        await this.ensureUnique(employeeId, date, id);
      }

      const status = this.normalizeStatus(dto.status ?? current.status);
      let workedMinutes = dto.workedMinutes ?? current.workedMinutes;
      const computed = this.minutesBetween(dto.checkInTime ?? current.checkInTime, dto.checkOutTime ?? current.checkOutTime);
      if (computed !== null) workedMinutes = computed;
      if (workedMinutes < 0) throw new BadRequestException('workedMinutes cannot be negative');

      const updated = await this.repo.preload({
        id,
        ...dto,
        employeeId,
        date,
        status,
        workedMinutes,
      } as any);
      if (!updated) throw new NotFoundException('Attendance not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate attendance detected');
      throw new InternalServerErrorException('Failed to update attendance');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Attendance not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete attendance');
    }
  }
}

