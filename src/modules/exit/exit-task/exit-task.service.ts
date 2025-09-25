import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { ExitTask, ExitTaskStatus } from './entities/exit-task.entity';
import { CreateExitTaskDto } from './dto/create-exit-task.dto';
import { UpdateExitTaskDto } from './dto/update-exit-task.dto';
import { QueryExitTaskDto } from './dto/query-exit-task.dto';

@Injectable()
export class ExitTaskService {
  constructor(
    @InjectRepository(ExitTask)
    private readonly repo: Repository<ExitTask>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private async ensureNoDuplicateOpen(
    employeeId: number,
    title: string,
    status: ExitTaskStatus,
    excludeId?: number,
  ) {
    if ([ExitTaskStatus.COMPLETED, ExitTaskStatus.CANCELED].includes(status)) return;
    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.employeeId = :employeeId', { employeeId })
      .andWhere('t.title = :title', { title })
      .andWhere('t.status IN (:...statuses)', {
        statuses: [ExitTaskStatus.PENDING, ExitTaskStatus.IN_PROGRESS],
      });
    if (excludeId) qb.andWhere('t.id != :excludeId', { excludeId });
    const conflict = await qb.getOne();
    if (conflict) {
      throw new ConflictException('An active task with the same title already exists for this employee');
    }
  }

  async create(dto: CreateExitTaskDto): Promise<any> {
    try {
      const status = dto.status ?? ExitTaskStatus.PENDING;
      await this.ensureNoDuplicateOpen(dto.employeeId, dto.title, status);

      let completedAt: Date | null | undefined = dto.completedAt ? this.toDate(dto.completedAt) : undefined;
      if (status === ExitTaskStatus.COMPLETED && !completedAt) {
        completedAt = new Date();
      }

      const entity = this.repo.create({
        ...dto,
        status,
        completedAt: completedAt ?? null,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (err instanceof ConflictException || err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create exit task');
    }
  }

  async findAll(query: QueryExitTaskDto = {} as QueryExitTaskDto): Promise<ExitTask[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ title: Like(term) });
        where.push({ description: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.assignedToId) baseWhere.assignedToId = query.assignedToId;
      if (query.status) baseWhere.status = query.status;
      if (typeof query.isMandatory === 'boolean') baseWhere.isMandatory = query.isMandatory;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.dueFrom || query.dueTo) {
        const from = query.dueFrom ?? '0001-01-01';
        const to = query.dueTo ?? '9999-12-31';
        baseWhere.dueDate = Between(from, to);
      }
      if (query.completedFrom || query.completedTo) {
        const from = query.completedFrom ?? '0001-01-01';
        const to = query.completedTo ?? '9999-12-31';
        baseWhere.completedAt = Between(new Date(from), new Date(to));
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
      throw new InternalServerErrorException('Failed to fetch exit tasks');
    }
  }

  async findOne(id: number): Promise<ExitTask> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Exit task not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch exit task');
    }
  }

  async update(id: number, dto: UpdateExitTaskDto): Promise<ExitTask> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Exit task not found');

      const nextStatus = dto.status ?? current.status;
      const nextTitle = dto.title ?? current.title;
      const employeeId = current.employeeId; // employeeId is immutable here
      await this.ensureNoDuplicateOpen(employeeId, nextTitle, nextStatus, id);

      let completedAt: Date | null | undefined = dto.completedAt ? this.toDate(dto.completedAt) : undefined;
      if (nextStatus === ExitTaskStatus.COMPLETED && !completedAt) {
        completedAt = current.completedAt ?? new Date();
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        title: nextTitle,
        status: nextStatus,
        completedAt: completedAt !== undefined ? completedAt : current.completedAt,
      } as any);
      if (!updated) throw new NotFoundException('Exit task not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      throw new InternalServerErrorException('Failed to update exit task');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Exit task not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete exit task');
    }
  }
}

