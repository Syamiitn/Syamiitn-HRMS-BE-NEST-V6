import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { LeaveAssignment } from './entities/leave-assignment.entity';
import { CreateLeaveAssignmentDto } from './dto/create-leave-assignment.dto';
import { UpdateLeaveAssignmentDto } from './dto/update-leave-assignment.dto';
import { QueryLeaveAssignmentDto } from './dto/query-leave-assignment.dto';

@Injectable()
export class LeaveAssignmentService {
  constructor(
    @InjectRepository(LeaveAssignment)
    private readonly repo: Repository<LeaveAssignment>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private ymd(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private validateRange(startStr?: string, endStr?: string) {
    const start = this.toDate(startStr);
    const end = this.toDate(endStr);
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid periodStart or periodEnd');
    }
    if (end < start) throw new BadRequestException('periodEnd cannot be before periodStart');
    return { start, end };
  }

  private toFixed2(n: number | undefined): string {
    const v = Number.isFinite(n as number) ? (n as number) : 0;
    if (v < 0) throw new BadRequestException('Values cannot be negative');
    return (Math.round(v * 100) / 100).toFixed(2);
  }

  private computeBalance(parts: {
    openingBalance?: number;
    allocated?: number;
    carriedForward?: number;
    used?: number;
    providedBalance?: number | undefined;
  }): { openingBalance: string; allocated: string; carriedForward: string; used: string; balance: string } {
    const opening = Number(parts.openingBalance ?? 0);
    const alloc = Number(parts.allocated ?? 0);
    const carry = Number(parts.carriedForward ?? 0);
    const used = Number(parts.used ?? 0);

    const openingS = this.toFixed2(opening);
    const allocS = this.toFixed2(alloc);
    const carryS = this.toFixed2(carry);
    const usedS = this.toFixed2(used);

    const balanceN = opening + alloc + carry - used;
    if (balanceN < 0) throw new BadRequestException('Computed balance cannot be negative');
    const balanceS = this.toFixed2(balanceN);

    if (parts.providedBalance !== undefined) {
      const provided = this.toFixed2(parts.providedBalance);
      if (provided !== balanceS) {
        throw new BadRequestException('Provided balance does not match computed balance');
      }
    }

    return { openingBalance: openingS, allocated: allocS, carriedForward: carryS, used: usedS, balance: balanceS };
  }

  private async ensureUniquePeriod(
    employeeId: number,
    leaveTypeId: number,
    periodStart: string,
    periodEnd: string,
    excludeId?: number,
  ) {
    const existing = await this.repo.findOne({ where: { employeeId, leaveTypeId, periodStart, periodEnd } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Leave assignment already exists for this period');
    }
  }

  async create(dto: CreateLeaveAssignmentDto): Promise<any> {
    try {
      this.validateRange(dto.periodStart, dto.periodEnd);
      await this.ensureUniquePeriod(dto.employeeId, dto.leaveTypeId, dto.periodStart, dto.periodEnd);

      const amounts = this.computeBalance({
        openingBalance: dto.openingBalance,
        allocated: dto.allocated,
        carriedForward: dto.carriedForward,
        used: dto.used,
        providedBalance: dto.balance,
      });

      const entity = this.repo.create({
        ...dto,
        ...amounts,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate leave assignment detected');
      throw new InternalServerErrorException('Failed to create leave assignment');
    }
  }

  async findAll(query: QueryLeaveAssignmentDto = {} as QueryLeaveAssignmentDto): Promise<LeaveAssignment[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ notes: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.leaveTypeId) baseWhere.leaveTypeId = query.leaveTypeId;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.periodStartFrom || query.periodStartTo) {
        const from = query.periodStartFrom ?? '0001-01-01';
        const to = query.periodStartTo ?? '9999-12-31';
        baseWhere.periodStart = Between(from, to);
      }
      if (query.minBalance !== undefined || query.maxBalance !== undefined) {
        const min = this.toFixed2(query.minBalance ?? 0);
        const max = this.toFixed2(query.maxBalance ?? 99999);
        baseWhere.balance = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch leave assignments');
    }
  }

  async findOne(id: number): Promise<LeaveAssignment> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Leave assignment not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch leave assignment');
    }
  }

  async update(id: number, dto: UpdateLeaveAssignmentDto): Promise<LeaveAssignment> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Leave assignment not found');

      const periodStart = dto.periodStart ?? current.periodStart;
      const periodEnd = dto.periodEnd ?? current.periodEnd;
      this.validateRange(periodStart, periodEnd);

      if (dto.periodStart || dto.periodEnd || dto.employeeId || dto.leaveTypeId) {
        const employeeId = dto.employeeId ?? current.employeeId;
        const leaveTypeId = dto.leaveTypeId ?? current.leaveTypeId;
        await this.ensureUniquePeriod(employeeId, leaveTypeId, periodStart, periodEnd, id);
      }

      const amounts = this.computeBalance({
        openingBalance: dto.openingBalance ?? Number(current.openingBalance),
        allocated: dto.allocated ?? Number(current.allocated),
        carriedForward: dto.carriedForward ?? Number(current.carriedForward),
        used: dto.used ?? Number(current.used),
        providedBalance: dto.balance as any,
      });

      const updated = await this.repo.preload({
        id,
        ...dto,
        periodStart,
        periodEnd,
        ...amounts,
      } as any);
      if (!updated) throw new NotFoundException('Leave assignment not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate leave assignment detected');
      throw new InternalServerErrorException('Failed to update leave assignment');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Leave assignment not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete leave assignment');
    }
  }
}

