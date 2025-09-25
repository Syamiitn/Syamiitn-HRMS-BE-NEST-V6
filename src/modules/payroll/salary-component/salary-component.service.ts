import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { CalculationMethod, SalaryComponent, SalaryComponentType } from './entities/salary-component.entity';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';
import { QuerySalaryComponentDto } from './dto/query-salary-component.dto';

@Injectable()
export class SalaryComponentService {
  constructor(
    @InjectRepository(SalaryComponent)
    private readonly repo: Repository<SalaryComponent>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toFixed2(n: number | undefined): string {
    const v = Number.isFinite(n as number) ? (n as number) : 0;
    if (v < 0) throw new BadRequestException('Amount/percentage cannot be negative');
    return (Math.round(v * 100) / 100).toFixed(2);
  }

  private async ensureUniqueFields(dto: { name?: string; code?: string }, excludeId?: number) {
    if (dto.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Salary component name already exists');
      }
    }
    if (dto.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Salary component code already exists');
      }
    }
  }

  private validateByMethod(method: CalculationMethod, amount?: number, percentage?: number, formula?: string) {
    switch (method) {
      case CalculationMethod.FIXED: {
        if (amount === undefined || amount === null) {
          throw new BadRequestException('amount is required for FIXED calculation');
        }
        if (amount < 0) throw new BadRequestException('amount cannot be negative');
        break;
      }
      case CalculationMethod.PERCENTAGE: {
        if (percentage === undefined || percentage === null) {
          throw new BadRequestException('percentage is required for PERCENTAGE calculation');
        }
        if (percentage <= 0 || percentage > 100) {
          throw new BadRequestException('percentage must be > 0 and <= 100');
        }
        break;
      }
      case CalculationMethod.FORMULA: {
        if (!formula || !formula.trim()) {
          throw new BadRequestException('formula is required for FORMULA calculation');
        }
        break;
      }
    }
  }

  async create(dto: CreateSalaryComponentDto): Promise<any> {
    try {
      await this.ensureUniqueFields({ name: dto.name, code: dto.code });
      const type = dto.type ?? SalaryComponentType.EARNING;
      const method = dto.calculationMethod ?? CalculationMethod.FIXED;
      this.validateByMethod(method, dto.amount, dto.percentage, dto.formula);

      const entity = this.repo.create({
        ...dto,
        type,
        calculationMethod: method,
        amount: this.toFixed2(dto.amount),
        percentage: this.toFixed2(dto.percentage),
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate salary component detected');
      throw new InternalServerErrorException('Failed to create salary component');
    }
  }

  async findAll(query: QuerySalaryComponentDto = {} as QuerySalaryComponentDto): Promise<SalaryComponent[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ code: Like(term) });
        where.push({ description: Like(term) });
        where.push({ dependsOnCodes: Like(term) });
      }

      const baseWhere: any = {};
      if (query.type) baseWhere.type = query.type;
      if (query.calculationMethod) baseWhere.calculationMethod = query.calculationMethod;
      if (typeof query.taxable === 'boolean') baseWhere.taxable = query.taxable;
      if (typeof query.preTax === 'boolean') baseWhere.preTax = query.preTax;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.minAmount !== undefined || query.maxAmount !== undefined) {
        const min = this.toFixed2(query.minAmount ?? 0);
        const max = this.toFixed2(query.maxAmount ?? 9999999999);
        baseWhere.amount = Between(min, max);
      }
      if (query.minPercentage !== undefined || query.maxPercentage !== undefined) {
        const min = this.toFixed2(query.minPercentage ?? 0);
        const max = this.toFixed2(query.maxPercentage ?? 100);
        baseWhere.percentage = Between(min, max);
      }
      if (query.minSequence !== undefined || query.maxSequence !== undefined) {
        const min = query.minSequence ?? 0;
        const max = query.maxSequence ?? 1000000;
        baseWhere.sequence = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch salary components');
    }
  }

  async findOne(id: number): Promise<SalaryComponent> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Salary component not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch salary component');
    }
  }

  async update(id: number, dto: UpdateSalaryComponentDto): Promise<SalaryComponent> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Salary component not found');

      const method: CalculationMethod = (dto.calculationMethod ?? current.calculationMethod) as CalculationMethod;
      const amount = dto.amount ?? Number(current.amount);
      const percentage = dto.percentage ?? Number(current.percentage);
      const formula = dto.formula ?? current.formula ?? undefined;
      this.validateByMethod(method, amount as any, percentage as any, formula as any);

      if (dto.name || dto.code) {
        await this.ensureUniqueFields({ name: dto.name, code: dto.code }, id);
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        calculationMethod: method,
        amount: dto.amount !== undefined ? this.toFixed2(dto.amount) : undefined,
        percentage: dto.percentage !== undefined ? this.toFixed2(dto.percentage) : undefined,
      } as any);
      if (!updated) throw new NotFoundException('Salary component not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate salary component detected');
      throw new InternalServerErrorException('Failed to update salary component');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Salary component not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete salary component');
    }
  }
}

