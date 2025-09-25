import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { PayrollRunItemBreakup, BreakupType } from './entities/payroll-run-item-breakup.entity';
import { CreatePayrollRunItemBreakupDto } from './dto/create-payroll-run-item-breakup.dto';
import { UpdatePayrollRunItemBreakupDto } from './dto/update-payroll-run-item-breakup.dto';
import { QueryPayrollRunItemBreakupDto } from './dto/query-payroll-run-item-breakup.dto';

@Injectable()
export class PayrollRunItemBreakupService {
  constructor(
    @InjectRepository(PayrollRunItemBreakup)
    private readonly repo: Repository<PayrollRunItemBreakup>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toFixed2(n: number | undefined): string {
    const v = Number.isFinite(n as number) ? (n as number) : 0;
    if (v < 0) throw new BadRequestException('amount cannot be negative');
    return (Math.round(v * 100) / 100).toFixed(2);
  }

  private async ensureUnique(
    payrollRunItemId: number,
    type: BreakupType,
    componentName: string,
    excludeId?: number,
  ) {
    const existing = await this.repo.findOne({ where: { payrollRunItemId, type, componentName } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Component already exists for this item and type');
    }
  }

  async create(dto: CreatePayrollRunItemBreakupDto): Promise<any> {
    try {
      await this.ensureUnique(dto.payrollRunItemId, dto.type, dto.componentName);
      const entity = this.repo.create({
        ...dto,
        amount: this.toFixed2(dto.amount),
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate breakup detected');
      throw new InternalServerErrorException('Failed to create payroll run item breakup');
    }
  }

  async findAll(query: QueryPayrollRunItemBreakupDto = {} as QueryPayrollRunItemBreakupDto): Promise<PayrollRunItemBreakup[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ componentName: Like(term) });
        where.push({ notes: Like(term) });
      }

      const baseWhere: any = {};
      if (query.payrollRunItemId) baseWhere.payrollRunItemId = query.payrollRunItemId;
      if (query.type) baseWhere.type = query.type;
      if (query.minAmount || query.maxAmount) {
        const min = typeof query.minAmount === 'number' ? query.minAmount.toFixed(2) : '0.00';
        const max = typeof query.maxAmount === 'number' ? query.maxAmount.toFixed(2) : '999999999999.99';
        baseWhere.amount = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch payroll run item breakups');
    }
  }

  async findOne(id: number): Promise<PayrollRunItemBreakup> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Payroll run item breakup not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch payroll run item breakup');
    }
  }

  async update(id: number, dto: UpdatePayrollRunItemBreakupDto): Promise<PayrollRunItemBreakup> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Payroll run item breakup not found');

      const nextItemId = dto.payrollRunItemId ?? current.payrollRunItemId;
      const nextType = dto.type ?? current.type;
      const nextName = dto.componentName ?? current.componentName;
      if (dto.payrollRunItemId || dto.type || dto.componentName) {
        await this.ensureUnique(nextItemId, nextType, nextName, id);
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        amount: dto.amount !== undefined ? this.toFixed2(dto.amount) : current.amount,
      } as any);
      if (!updated) throw new NotFoundException('Payroll run item breakup not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate breakup detected');
      throw new InternalServerErrorException('Failed to update payroll run item breakup');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Payroll run item breakup not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete payroll run item breakup');
    }
  }
}

