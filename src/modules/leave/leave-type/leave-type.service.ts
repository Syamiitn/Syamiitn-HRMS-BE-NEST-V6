import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { LeaveType } from './entities/leave-type.entity';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { QueryLeaveTypeDto } from './dto/query-leave-type.dto';

@Injectable()
export class LeaveTypeService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly repo: Repository<LeaveType>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toFixed2(n: number | undefined): string | undefined {
    if (n === undefined || n === null) return undefined;
    const v = Number.isFinite(n as number) ? (n as number) : 0;
    if (v < 0) return '0.00';
    return (Math.round(v * 100) / 100).toFixed(2);
  }

  private async ensureUniqueFields(dto: { name?: string; code?: string }, excludeId?: number) {
    if (dto.name) {
      const existing = await this.repo.findOne({ where: { name: dto.name } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Leave type name already exists');
      }
    }
    if (dto.code) {
      const existing = await this.repo.findOne({ where: { code: dto.code } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Leave type code already exists');
      }
    }
  }

  async create(dto: CreateLeaveTypeDto): Promise<any> {
    try {
      await this.ensureUniqueFields({ name: dto.name, code: dto.code });
      const entity = this.repo.create({
        ...dto,
        maxDaysPerYear: this.toFixed2(dto.maxDaysPerYear) ?? '0.00',
        maxCarryForward: this.toFixed2(dto.maxCarryForward) ?? '0.00',
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate leave type detected');
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create leave type');
    }
  }

  async findAll(query: QueryLeaveTypeDto = {} as QueryLeaveTypeDto): Promise<LeaveType[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ name: Like(term) });
        where.push({ code: Like(term) });
        where.push({ description: Like(term) });
      }

      const baseWhere: any = {};
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (typeof query.isPaid === 'boolean') baseWhere.isPaid = query.isPaid;
      if (typeof query.requiresApproval === 'boolean') baseWhere.requiresApproval = query.requiresApproval;
      if (query.minDays !== undefined || query.maxDays !== undefined) {
        const min = this.toFixed2(query.minDays ?? 0) as string;
        const max = this.toFixed2(query.maxDays ?? 99999) as string;
        baseWhere.maxDaysPerYear = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch leave types');
    }
  }

  async findOne(id: number): Promise<LeaveType> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Leave type not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch leave type');
    }
  }

  async update(id: number, dto: UpdateLeaveTypeDto): Promise<LeaveType> {
    try {
      if (dto.name || dto.code) {
        await this.ensureUniqueFields({ name: dto.name, code: dto.code }, id);
      }
      const updated = await this.repo.preload({
        id,
        ...dto,
        maxDaysPerYear:
          dto.maxDaysPerYear !== undefined ? (this.toFixed2(dto.maxDaysPerYear) as string) : undefined,
        maxCarryForward:
          dto.maxCarryForward !== undefined ? (this.toFixed2(dto.maxCarryForward) as string) : undefined,
      } as any);
      if (!updated) throw new NotFoundException('Leave type not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate leave type detected');
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update leave type');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Leave type not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete leave type');
    }
  }
}

