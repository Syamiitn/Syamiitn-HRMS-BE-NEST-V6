import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { PayrollRun, PayrollRunStatus } from './entities/payroll-run.entity';
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';
import { UpdatePayrollRunDto } from './dto/update-payroll-run.dto';
import { QueryPayrollRunDto } from './dto/query-payroll-run.dto';

@Injectable()
export class PayrollRunService {
  constructor(
    @InjectRepository(PayrollRun)
    private readonly repo: Repository<PayrollRun>,
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

  private validateDates(periodStart?: string, periodEnd?: string, payDate?: string) {
    const start = this.toDate(periodStart);
    const end = this.toDate(periodEnd);
    const pay = this.toDate(payDate);

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid periodStart or periodEnd');
    }
    if (end < start) throw new BadRequestException('periodEnd cannot be before periodStart');
    if (pay && pay < end) throw new BadRequestException('payDate cannot be before periodEnd');
  }

  private async ensureUniquePeriod(periodStart: string, periodEnd: string, excludeId?: number) {
    const existing = await this.repo.findOne({ where: { periodStart, periodEnd } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('A payroll run already exists for this period');
    }
  }

  private async ensureUniqueCode(code?: string, excludeId?: number) {
    if (!code) return;
    const existing = await this.repo.findOne({ where: { code } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Payroll run code already exists');
    }
  }

  async create(dto: CreatePayrollRunDto): Promise<any> {
    try {
      this.validateDates(dto.periodStart, dto.periodEnd, dto.payDate);
      await this.ensureUniquePeriod(dto.periodStart, dto.periodEnd);
      await this.ensureUniqueCode(dto.code);

      const status = dto.status ?? PayrollRunStatus.DRAFT;
      let payDate = dto.payDate;
      if (status === PayrollRunStatus.PAID && !payDate) {
        payDate = this.ymd(new Date());
      }

      const entity = this.repo.create({
        ...dto,
        status,
        payDate,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) {
        throw new ConflictException('Duplicate payroll run detected');
      }
      throw new InternalServerErrorException('Failed to create payroll run');
    }
  }

  async findAll(query: QueryPayrollRunDto = {} as QueryPayrollRunDto): Promise<PayrollRun[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ notes: Like(term) });
        where.push({ code: Like(term) });
      }

      const baseWhere: any = {};
      if (query.status) baseWhere.status = query.status;
      if (query.code) baseWhere.code = query.code;

      // Date range filters
      if (query.periodStartFrom || query.periodStartTo) {
        const from = query.periodStartFrom ?? '0001-01-01';
        const to = query.periodStartTo ?? '9999-12-31';
        baseWhere.periodStart = Between(from, to);
      }
      if (query.payDateFrom || query.payDateTo) {
        const from = query.payDateFrom ?? '0001-01-01';
        const to = query.payDateTo ?? '9999-12-31';
        baseWhere.payDate = Between(from, to);
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
      throw new InternalServerErrorException('Failed to fetch payroll runs');
    }
  }

  async findOne(id: number): Promise<PayrollRun> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Payroll run not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch payroll run');
    }
  }

  async update(id: number, dto: UpdatePayrollRunDto): Promise<PayrollRun> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Payroll run not found');

      const periodStart = dto.periodStart ?? current.periodStart;
      const periodEnd = dto.periodEnd ?? current.periodEnd;
      const payDate = dto.payDate ?? current.payDate ?? undefined;
      this.validateDates(periodStart, periodEnd, payDate);

      if (dto.periodStart || dto.periodEnd) {
        await this.ensureUniquePeriod(periodStart, periodEnd, id);
      }
      if (dto.code) {
        await this.ensureUniqueCode(dto.code, id);
      }

      const nextStatus = dto.status ?? current.status;
      let nextPayDate = payDate;
      if (nextStatus === PayrollRunStatus.PAID && !nextPayDate) {
        nextPayDate = this.ymd(new Date());
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        periodStart,
        periodEnd,
        payDate: nextPayDate,
        status: nextStatus,
      } as any);
      if (!updated) throw new NotFoundException('Payroll run not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate payroll run detected');
      throw new InternalServerErrorException('Failed to update payroll run');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Payroll run not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete payroll run');
    }
  }
}

