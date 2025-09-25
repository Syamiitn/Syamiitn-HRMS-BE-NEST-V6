import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { ExitProcess, ExitProcessStatus } from './entities/exit-process.entity';
import { CreateExitProcessDto } from './dto/create-exit-process.dto';
import { UpdateExitProcessDto } from './dto/update-exit-process.dto';
import { QueryExitProcessDto } from './dto/query-exit-process.dto';

@Injectable()
export class ExitProcessService {
  constructor(
    @InjectRepository(ExitProcess)
    private readonly repo: Repository<ExitProcess>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private validateDates(startStr?: string, plannedStr?: string, actualStr?: string) {
    const start = this.toDate(startStr);
    if (!start || isNaN(start.getTime())) throw new BadRequestException('Invalid startDate');
    if (plannedStr) {
      const planned = this.toDate(plannedStr)!;
      if (isNaN(planned.getTime())) throw new BadRequestException('Invalid plannedExitDate');
      if (planned < start) throw new BadRequestException('plannedExitDate cannot be before startDate');
    }
    if (actualStr) {
      const actual = this.toDate(actualStr)!;
      if (isNaN(actual.getTime())) throw new BadRequestException('Invalid actualExitDate');
      if (actual < start) throw new BadRequestException('actualExitDate cannot be before startDate');
      if (plannedStr && actualStr) {
        const planned = this.toDate(plannedStr)!;
        if (actual < planned) throw new BadRequestException('actualExitDate cannot be before plannedExitDate');
      }
    }
  }

  private requiresAllClearances(status: ExitProcessStatus): boolean {
    return status === ExitProcessStatus.CLEARED || status === ExitProcessStatus.COMPLETED;
  }

  private areClearancesSatisfied(e: Partial<ExitProcess>): boolean {
    return !!(e.assetsCleared && e.financeCleared && e.itCleared && e.hrCleared && e.managerCleared);
  }

  private async ensureNoOpenForEmployee(employeeId: number, status: ExitProcessStatus, excludeId?: number) {
    if (status === ExitProcessStatus.CANCELED) return;
    const qb = this.repo
      .createQueryBuilder('ep')
      .where('ep.employeeId = :employeeId', { employeeId })
      .andWhere('ep.status != :canceled', { canceled: ExitProcessStatus.CANCELED });
    if (excludeId) qb.andWhere('ep.id != :excludeId', { excludeId });
    const existing = await qb.getOne();
    if (existing) throw new ConflictException('An active exit process already exists for this employee');
  }

  async create(dto: CreateExitProcessDto): Promise<any> {
    try {
      const status = dto.status ?? ExitProcessStatus.INITIATED;
      this.validateDates(dto.startDate, dto.plannedExitDate, dto.actualExitDate);
      await this.ensureNoOpenForEmployee(dto.employeeId, status);

      if (this.requiresAllClearances(status) && !this.areClearancesSatisfied(dto as any)) {
        throw new BadRequestException('All clearances must be true when status is CLEARED or COMPLETED');
      }

      let completedAt: Date | null | undefined = undefined;
      if (status === ExitProcessStatus.COMPLETED) {
        completedAt = new Date();
      }

      const entity = this.repo.create({
        ...dto,
        status,
        completedAt: completedAt ?? null,
      } as any);
      return await this.repo.save(entity);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create exit process');
    }
  }

  async findAll(query: QueryExitProcessDto = {} as QueryExitProcessDto): Promise<ExitProcess[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ reason: Like(term) });
        where.push({ clearanceNotes: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.status) baseWhere.status = query.status;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (typeof query.assetsCleared === 'boolean') baseWhere.assetsCleared = query.assetsCleared;
      if (typeof query.financeCleared === 'boolean') baseWhere.financeCleared = query.financeCleared;
      if (typeof query.itCleared === 'boolean') baseWhere.itCleared = query.itCleared;
      if (typeof query.hrCleared === 'boolean') baseWhere.hrCleared = query.hrCleared;
      if (typeof query.managerCleared === 'boolean') baseWhere.managerCleared = query.managerCleared;
      if (query.startFrom || query.startTo) {
        const from = query.startFrom ?? '0001-01-01';
        const to = query.startTo ?? '9999-12-31';
        baseWhere.startDate = Between(from, to);
      }
      if (query.plannedFrom || query.plannedTo) {
        const from = query.plannedFrom ?? '0001-01-01';
        const to = query.plannedTo ?? '9999-12-31';
        baseWhere.plannedExitDate = Between(from, to);
      }
      if (query.actualFrom || query.actualTo) {
        const from = query.actualFrom ?? '0001-01-01';
        const to = query.actualTo ?? '9999-12-31';
        baseWhere.actualExitDate = Between(from, to);
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
      throw new InternalServerErrorException('Failed to fetch exit processes');
    }
  }

  async findOne(id: number): Promise<ExitProcess> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Exit process not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch exit process');
    }
  }

  async update(id: number, dto: UpdateExitProcessDto): Promise<ExitProcess> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Exit process not found');

      const status = dto.status ?? current.status;
      const startDate = dto.startDate ?? current.startDate;
      const planned = dto.plannedExitDate ?? current.plannedExitDate ?? undefined;
      const actual = dto.actualExitDate ?? current.actualExitDate ?? undefined;
      this.validateDates(startDate, planned as any, actual as any);

      await this.ensureNoOpenForEmployee(current.employeeId, status, id);

      if (this.requiresAllClearances(status)) {
        const candidate = {
          assetsCleared: dto.assetsCleared ?? current.assetsCleared,
          financeCleared: dto.financeCleared ?? current.financeCleared,
          itCleared: dto.itCleared ?? current.itCleared,
          hrCleared: dto.hrCleared ?? current.hrCleared,
          managerCleared: dto.managerCleared ?? current.managerCleared,
        } as ExitProcess;
        if (!this.areClearancesSatisfied(candidate)) {
          throw new BadRequestException('All clearances must be true when status is CLEARED or COMPLETED');
        }
      }

      let completedAt: Date | null | undefined = (dto as any)?.completedAt;
      if (status === ExitProcessStatus.COMPLETED && !completedAt) {
        completedAt = current.completedAt ?? new Date();
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        status,
        startDate,
        plannedExitDate: planned as any,
        actualExitDate: actual as any,
        completedAt: completedAt !== undefined ? completedAt : current.completedAt,
      } as any);
      if (!updated) throw new NotFoundException('Exit process not found');
      return await this.repo.save(updated);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      throw new InternalServerErrorException('Failed to update exit process');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Exit process not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete exit process');
    }
  }
}

