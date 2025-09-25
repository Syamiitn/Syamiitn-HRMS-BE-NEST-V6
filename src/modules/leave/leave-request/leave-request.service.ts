import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { LeaveRequest, LeaveRequestStatus } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { QueryLeaveRequestDto } from './dto/query-leave-request.dto';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly repo: Repository<LeaveRequest>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private toFixed2(n: number): string {
    if (!Number.isFinite(n)) throw new BadRequestException('Invalid totalDays');
    const v = Math.max(0, Math.round(n * 100) / 100);
    return v.toFixed(2);
  }

  private inclusiveDays(start: Date, end: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    return Math.floor((endUTC - startUTC) / msPerDay) + 1;
  }

  private validateRange(startStr?: string, endStr?: string) {
    const start = this.toDate(startStr);
    const end = this.toDate(endStr);
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }
    if (end < start) throw new BadRequestException('endDate cannot be before startDate');
    return { start, end };
  }

  private computeTotalDays(startStr: string, endStr: string, isHalfDay?: boolean, provided?: number): string {
    const { start, end } = this.validateRange(startStr, endStr);
    if (isHalfDay) {
      if (this.inclusiveDays(start, end) !== 1) {
        throw new BadRequestException('Half-day leave must have the same start and end date');
      }
      if (provided !== undefined && provided > 0.5) {
        throw new BadRequestException('Half-day leave cannot exceed 0.5 day');
      }
      return this.toFixed2(0.5);
    }
    const days = this.inclusiveDays(start, end);
    if (provided !== undefined && Math.abs(provided - days) > 0.01) {
      throw new BadRequestException('totalDays does not match the date range');
    }
    return this.toFixed2(days);
  }

  private async ensureNoOverlap(
    employeeId: number,
    startDate: string,
    endDate: string,
    status: LeaveRequestStatus,
    excludeId?: number,
  ) {
    // For pending/approved requests, disallow overlaps for the same employee
    if ([LeaveRequestStatus.REJECTED, LeaveRequestStatus.CANCELED].includes(status)) return;
    const qb = this.repo
      .createQueryBuilder('lr')
      .where('lr.employeeId = :employeeId', { employeeId })
      .andWhere('lr.status IN (:...statuses)', {
        statuses: [LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED],
      })
      .andWhere('lr.startDate <= :endDate AND lr.endDate >= :startDate', {
        startDate,
        endDate,
      });
    if (excludeId) qb.andWhere('lr.id != :excludeId', { excludeId });
    const conflict = await qb.getOne();
    if (conflict) throw new ConflictException('Overlapping leave request exists for this period');
  }

  async create(dto: CreateLeaveRequestDto): Promise<any> {
    try {
      const status = dto.status ?? LeaveRequestStatus.PENDING;
      const totalDays = this.computeTotalDays(dto.startDate, dto.endDate, dto.isHalfDay, dto.totalDays);
      await this.ensureNoOverlap(dto.employeeId, dto.startDate, dto.endDate, status);

      let approvedAt = dto.approvedAt ? this.toDate(dto.approvedAt) : null;
      if (status === LeaveRequestStatus.APPROVED && !approvedAt) {
        approvedAt = new Date();
      }

      const entity = this.repo.create({
        ...dto,
        totalDays,
        status,
        approvedAt: approvedAt ?? null,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      throw new InternalServerErrorException('Failed to create leave request');
    }
  }

  async findAll(query: QueryLeaveRequestDto = {} as QueryLeaveRequestDto): Promise<LeaveRequest[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ reason: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.leaveTypeId) baseWhere.leaveTypeId = query.leaveTypeId;
      if (query.status) baseWhere.status = query.status;
      if (query.startFrom || query.endTo) {
        const from = query.startFrom ?? '0001-01-01';
        const to = query.endTo ?? '9999-12-31';
        baseWhere.startDate = Between(from, to);
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
      throw new InternalServerErrorException('Failed to fetch leave requests');
    }
  }

  async findOne(id: number): Promise<LeaveRequest> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Leave request not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch leave request');
    }
  }

  async update(id: number, dto: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Leave request not found');

      const startDate = dto.startDate ?? current.startDate;
      const endDate = dto.endDate ?? current.endDate;
      const isHalfDay = dto.isHalfDay ?? current.isHalfDay;
      const nextStatus = dto.status ?? current.status;
      const totalDays = this.computeTotalDays(startDate, endDate, isHalfDay, dto.totalDays as any);

      await this.ensureNoOverlap(current.employeeId, startDate, endDate, nextStatus, id);

      let approvedAt: Date | null | undefined = dto.approvedAt ? this.toDate(dto.approvedAt) : undefined;
      if (nextStatus === LeaveRequestStatus.APPROVED && !approvedAt) {
        approvedAt = current.approvedAt ?? new Date();
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        startDate,
        endDate,
        isHalfDay,
        status: nextStatus,
        totalDays,
        approvedAt: approvedAt !== undefined ? approvedAt : current.approvedAt,
      } as any);
      if (!updated) throw new NotFoundException('Leave request not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      throw new InternalServerErrorException('Failed to update leave request');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Leave request not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete leave request');
    }
  }
}

