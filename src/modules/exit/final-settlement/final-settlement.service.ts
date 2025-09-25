import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { FinalSettlement, FinalSettlementStatus } from './entities/final-settlement.entity';
import { CreateFinalSettlementDto } from './dto/create-final-settlement.dto';
import { UpdateFinalSettlementDto } from './dto/update-final-settlement.dto';
import { QueryFinalSettlementDto } from './dto/query-final-settlement.dto';

@Injectable()
export class FinalSettlementService {
  constructor(
    @InjectRepository(FinalSettlement)
    private readonly repo: Repository<FinalSettlement>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toFixed2(n: number | undefined): string {
    const v = Number.isFinite(n as number) ? (n as number) : 0;
    if (v < 0) throw new BadRequestException('Amount values cannot be negative');
    return (Math.round(v * 100) / 100).toFixed(2);
  }

  private computeAmounts(input: {
    salaryDue?: number;
    leaveEncashment?: number;
    gratuity?: number;
    bonus?: number;
    otherEarnings?: number;
    statutoryDeductions?: number;
    otherDeductions?: number;
    totalEarnings?: number;
    totalDeductions?: number;
    netPayable?: number;
  }) {
    const salaryDue = Number(input.salaryDue ?? 0);
    const leaveEncashment = Number(input.leaveEncashment ?? 0);
    const gratuity = Number(input.gratuity ?? 0);
    const bonus = Number(input.bonus ?? 0);
    const otherEarnings = Number(input.otherEarnings ?? 0);
    const statutoryDeductions = Number(input.statutoryDeductions ?? 0);
    const otherDeductions = Number(input.otherDeductions ?? 0);

    if ([salaryDue, leaveEncashment, gratuity, bonus, otherEarnings, statutoryDeductions, otherDeductions].some((n) => n < 0)) {
      throw new BadRequestException('Amounts cannot be negative');
    }

    const gross = input.totalEarnings ?? salaryDue + leaveEncashment + gratuity + bonus + otherEarnings;
    const ded = input.totalDeductions ?? statutoryDeductions + otherDeductions;
    const net = input.netPayable ?? gross - ded;
    if (gross < 0 || ded < 0 || net < 0) {
      throw new BadRequestException('Computed totals cannot be negative');
    }
    return {
      salaryDue: this.toFixed2(salaryDue),
      leaveEncashment: this.toFixed2(leaveEncashment),
      gratuity: this.toFixed2(gratuity),
      bonus: this.toFixed2(bonus),
      otherEarnings: this.toFixed2(otherEarnings),
      statutoryDeductions: this.toFixed2(statutoryDeductions),
      otherDeductions: this.toFixed2(otherDeductions),
      totalEarnings: this.toFixed2(gross),
      totalDeductions: this.toFixed2(ded),
      netPayable: this.toFixed2(net),
    };
  }

  private async ensureUniqueReference(referenceCode?: string, excludeId?: number) {
    if (!referenceCode) return;
    const existing = await this.repo.findOne({ where: { referenceCode } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Final settlement referenceCode already exists');
    }
  }

  private async ensureNoOpenForEmployee(employeeId: number, status: FinalSettlementStatus, excludeId?: number) {
    if (status === FinalSettlementStatus.CANCELED) return;
    const qb = this.repo
      .createQueryBuilder('fs')
      .where('fs.employeeId = :employeeId', { employeeId })
      .andWhere('fs.status != :canceled', { canceled: FinalSettlementStatus.CANCELED });
    if (excludeId) qb.andWhere('fs.id != :excludeId', { excludeId });
    const conflict = await qb.getOne();
    if (conflict) throw new ConflictException('An active final settlement already exists for this employee');
  }

  async create(dto: CreateFinalSettlementDto): Promise<any> {
    try {
      const status = dto.status ?? FinalSettlementStatus.DRAFT;
      await this.ensureUniqueReference(dto.referenceCode);
      await this.ensureNoOpenForEmployee(dto.employeeId, status);

      const amounts = this.computeAmounts(dto);

      // If status is PAID and settlementDate not provided, set today
      let settlementDate = dto.settlementDate;
      if (status === FinalSettlementStatus.PAID && !settlementDate) {
        settlementDate = new Date().toISOString().slice(0, 10);
      }

      const entity = this.repo.create({
        ...dto,
        ...amounts,
        status,
        settlementDate,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate final settlement detected');
      if (err instanceof BadRequestException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create final settlement');
    }
  }

  async findAll(query: QueryFinalSettlementDto = {} as QueryFinalSettlementDto): Promise<FinalSettlement[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ referenceCode: Like(term) });
        where.push({ remarks: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.status) baseWhere.status = query.status;
      if (query.lastWorkingFrom || query.lastWorkingTo) {
        const from = query.lastWorkingFrom ?? '0001-01-01';
        const to = query.lastWorkingTo ?? '9999-12-31';
        baseWhere.lastWorkingDate = Between(from, to);
      }
      if (query.settlementFrom || query.settlementTo) {
        const from = query.settlementFrom ?? '0001-01-01';
        const to = query.settlementTo ?? '9999-12-31';
        baseWhere.settlementDate = Between(from, to);
      }
      if (query.minNet !== undefined || query.maxNet !== undefined) {
        const min = this.toFixed2(query.minNet ?? 0);
        const max = this.toFixed2(query.maxNet ?? 999999999999.99);
        baseWhere.netPayable = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch final settlements');
    }
  }

  async findOne(id: number): Promise<FinalSettlement> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Final settlement not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch final settlement');
    }
  }

  async update(id: number, dto: UpdateFinalSettlementDto): Promise<FinalSettlement> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Final settlement not found');

      const nextStatus = dto.status ?? current.status;
      await this.ensureUniqueReference(dto.referenceCode, id);
      await this.ensureNoOpenForEmployee(current.employeeId, nextStatus, id);

      const amounts = this.computeAmounts({
        salaryDue: dto.salaryDue ?? Number(current.salaryDue),
        leaveEncashment: dto.leaveEncashment ?? Number(current.leaveEncashment),
        gratuity: dto.gratuity ?? Number(current.gratuity),
        bonus: dto.bonus ?? Number(current.bonus),
        otherEarnings: dto.otherEarnings ?? Number(current.otherEarnings),
        statutoryDeductions: dto.statutoryDeductions ?? Number(current.statutoryDeductions),
        otherDeductions: dto.otherDeductions ?? Number(current.otherDeductions),
        totalEarnings: dto.totalEarnings as any,
        totalDeductions: dto.totalDeductions as any,
        netPayable: dto.netPayable as any,
      });

      let settlementDate = dto.settlementDate ?? current.settlementDate ?? undefined;
      if (nextStatus === FinalSettlementStatus.PAID && !settlementDate) {
        settlementDate = new Date().toISOString().slice(0, 10);
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        ...amounts,
        status: nextStatus,
        settlementDate,
      } as any);
      if (!updated) throw new NotFoundException('Final settlement not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate final settlement detected');
      throw new InternalServerErrorException('Failed to update final settlement');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Final settlement not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete final settlement');
    }
  }
}

