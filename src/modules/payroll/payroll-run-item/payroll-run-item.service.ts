import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PayrollRunItem, PayrollRunItemStatus } from './entities/payroll-run-item.entity';
import { CreatePayrollRunItemDto } from './dto/create-payroll-run-item.dto';
import { UpdatePayrollRunItemDto } from './dto/update-payroll-run-item.dto';
import { QueryPayrollRunItemDto } from './dto/query-payroll-run-item.dto';

@Injectable()
export class PayrollRunItemService {
  constructor(
    @InjectRepository(PayrollRunItem)
    private readonly repo: Repository<PayrollRunItem>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toFixed2(n: number | undefined): string {
    const v = Number.isFinite(n as number) ? (n as number) : 0;
    return (Math.round(v * 100) / 100).toFixed(2);
  }

  private computeAmounts(input: {
    basicPay?: number;
    allowances?: number;
    deductions?: number;
    grossPay?: number;
    netPay?: number;
  }) {
    const basic = Number.isFinite(input.basicPay as number) ? (input.basicPay as number) : 0;
    const allow = Number.isFinite(input.allowances as number) ? (input.allowances as number) : 0;
    const ded = Number.isFinite(input.deductions as number) ? (input.deductions as number) : 0;

    if (basic < 0 || allow < 0 || ded < 0) {
      throw new BadRequestException('Amount values cannot be negative');
    }

    const gross = input.grossPay ?? basic + allow;
    const net = input.netPay ?? gross - ded;

    if (gross < 0 || net < 0) {
      throw new BadRequestException('Computed amounts cannot be negative');
    }

    return {
      basicPay: this.toFixed2(basic),
      allowances: this.toFixed2(allow),
      deductions: this.toFixed2(ded),
      grossPay: this.toFixed2(gross),
      netPay: this.toFixed2(net),
    };
  }

  private async ensureUnique(runId: number, employeeId: number, excludeId?: number) {
    const existing = await this.repo.findOne({ where: { payrollRunId: runId, employeeId } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Payroll run item already exists for this employee in the run');
    }
  }

  async create(dto: CreatePayrollRunItemDto): Promise<any> {
    try {
      await this.ensureUnique(dto.payrollRunId, dto.employeeId);
      const amounts = this.computeAmounts(dto);
      const status = dto.status ?? PayrollRunItemStatus.DRAFT;
      const entity = this.repo.create({
        ...dto,
        ...amounts,
        status,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate payroll run item detected');
      throw new InternalServerErrorException('Failed to create payroll run item');
    }
  }

  async findAll(query: QueryPayrollRunItemDto = {} as QueryPayrollRunItemDto): Promise<PayrollRunItem[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ notes: Like(term) });
      }

      const baseWhere: any = {};
      if (query.payrollRunId) baseWhere.payrollRunId = query.payrollRunId;
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.status) baseWhere.status = query.status;

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
      throw new InternalServerErrorException('Failed to fetch payroll run items');
    }
  }

  async findOne(id: number): Promise<PayrollRunItem> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Payroll run item not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch payroll run item');
    }
  }

  async update(id: number, dto: UpdatePayrollRunItemDto): Promise<PayrollRunItem> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Payroll run item not found');

      if (dto.payrollRunId || dto.employeeId) {
        const runId = dto.payrollRunId ?? current.payrollRunId;
        const employeeId = dto.employeeId ?? current.employeeId;
        await this.ensureUnique(runId, employeeId, id);
      }

      const amounts = this.computeAmounts({
        basicPay: (dto.basicPay as any) ?? Number(current.basicPay),
        allowances: (dto.allowances as any) ?? Number(current.allowances),
        deductions: (dto.deductions as any) ?? Number(current.deductions),
        grossPay: (dto.grossPay as any) ?? Number(current.grossPay),
        netPay: (dto.netPay as any) ?? Number(current.netPay),
      });

      const updated = await this.repo.preload({
        id,
        ...dto,
        ...amounts,
      } as any);
      if (!updated) throw new NotFoundException('Payroll run item not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate payroll run item detected');
      throw new InternalServerErrorException('Failed to update payroll run item');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Payroll run item not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete payroll run item');
    }
  }
}

