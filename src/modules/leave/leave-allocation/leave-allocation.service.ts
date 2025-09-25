import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { LeaveAllocation } from './entities/leave-allocation.entity';
import { CreateLeaveAllocationDto } from './dto/create-leave-allocation.dto';
import { UpdateLeaveAllocationDto } from './dto/update-leave-allocation.dto';
import { QueryLeaveAllocationDto } from './dto/query-leave-allocation.dto';

@Injectable()
export class LeaveAllocationService {
  constructor(
    @InjectRepository(LeaveAllocation)
    private readonly repo: Repository<LeaveAllocation>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toFixed2(n: number | undefined): string {
    const v = Number.isFinite(n as number) ? (n as number) : 0;
    if (v < 0) throw new BadRequestException('allocatedDays cannot be negative');
    return (Math.round(v * 100) / 100).toFixed(2);
  }

  async create(dto: CreateLeaveAllocationDto): Promise<any> {
    try {
      const entity = this.repo.create({
        ...dto,
        allocatedDays: this.toFixed2(dto.allocatedDays),
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate leave allocation detected');
      throw new InternalServerErrorException('Failed to create leave allocation');
    }
  }

  async findAll(query: QueryLeaveAllocationDto = {} as QueryLeaveAllocationDto): Promise<LeaveAllocation[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ reason: Like(term) });
        where.push({ referenceCode: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.leaveTypeId) baseWhere.leaveTypeId = query.leaveTypeId;
      if (query.year) baseWhere.year = query.year;
      if (query.minDays !== undefined || query.maxDays !== undefined) {
        const min = this.toFixed2(query.minDays ?? 0);
        const max = this.toFixed2(query.maxDays ?? 99999);
        baseWhere.allocatedDays = Between(min, max);
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
      throw new InternalServerErrorException('Failed to fetch leave allocations');
    }
  }

  async findOne(id: number): Promise<LeaveAllocation> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Leave allocation not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch leave allocation');
    }
  }

  async update(id: number, dto: UpdateLeaveAllocationDto): Promise<LeaveAllocation> {
    try {
      const updated = await this.repo.preload({
        id,
        ...dto,
        allocatedDays:
          dto.allocatedDays !== undefined ? (this.toFixed2(dto.allocatedDays) as string) : undefined,
      } as any);
      if (!updated) throw new NotFoundException('Leave allocation not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate leave allocation detected');
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update leave allocation');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Leave allocation not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete leave allocation');
    }
  }
}

