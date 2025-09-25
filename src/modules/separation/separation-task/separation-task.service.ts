import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, Like, Repository } from 'typeorm';
import { Separation } from '../separation/entities/separation.entity';
import { SeparationTask, SeparationTaskStatus } from './entities/separation-task.entity';
import { CreateSeparationTaskDto } from './dto/create-separation-task.dto';
import { UpdateSeparationTaskDto } from './dto/update-separation-task.dto';
import { QuerySeparationTaskDto } from './dto/query-separation-task.dto';

@Injectable()
export class SeparationTaskService {
  constructor(
    @InjectRepository(SeparationTask)
    private readonly repo: Repository<SeparationTask>,
    @InjectRepository(Separation)
    private readonly sepRepo: Repository<Separation>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private async ensureSeparationExists(id: string): Promise<Separation> {
    const sep = await this.sepRepo.findOne({ where: { id } });
    if (!sep) throw new NotFoundException('Separation not found');
    return sep;
  }

  private validateDueWithinSeparation(sep: Separation, due?: string | null) {
    if (!due) return;
    const dueDate = this.toDate(due);
    if (!dueDate || isNaN(dueDate.getTime())) throw new BadRequestException('Invalid dueDate');
    const start = this.toDate(sep.intendedDate)!;
    const end = this.toDate(sep.approvedLastWorkingDate ?? sep.intendedLastWorkingDate)!;
    if (dueDate < start || dueDate > end) {
      throw new BadRequestException('dueDate must be within the separation window');
    }
  }

  async create(dto: CreateSeparationTaskDto): Promise<SeparationTask> {
    try {
      const sep = await this.ensureSeparationExists(dto.separationId);
      this.validateDueWithinSeparation(sep, dto.dueDate);

      const entity = this.repo.create({ ...(dto as any) } as DeepPartial<SeparationTask>);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to create separation task');
    }
  }

  async findAll(query: QuerySeparationTaskDto): Promise<SeparationTask[]> {
    const base: any = {};
    const where: any[] = [];

    if (query.separationId) base.separationId = query.separationId;
    if (query.assignedTo) base.assignedTo = query.assignedTo;
    if (query.status) base.status = query.status;
    if (query.priority) base.priority = query.priority;

    if (query.dueFrom || query.dueTo) {
      const from = query.dueFrom ?? '0001-01-01';
      const to = query.dueTo ?? '9999-12-31';
      base.dueDate = Between(from, to);
    }

    if (query.search) {
      const term = `%${query.search}%`;
      where.push({ title: Like(term) });
      where.push({ description: Like(term) });
      where.push({ remarks: Like(term) });
    }

    const orderByField = query.sortBy ?? 'createdAt';
    const orderByDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;

    const options: any = {
      where: where.length ? where.map((w) => ({ ...w, ...base })) : base,
      order: { [orderByField]: orderByDir },
    };
    if (query.page && query.limit) {
      options.skip = (query.page - 1) * query.limit;
      options.take = query.limit;
    }
    return this.repo.find(options);
  }

  async findOne(id: string): Promise<SeparationTask> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Separation task not found');
    return task;
  }

  async update(id: string, dto: UpdateSeparationTaskDto): Promise<SeparationTask> {
    if (dto.dueDate || dto.separationId) {
      const sepId = dto.separationId ?? (await this.findOne(id)).separationId;
      const sep = await this.ensureSeparationExists(sepId);
      this.validateDueWithinSeparation(sep, dto.dueDate);
    }
    const entity = await this.repo.preload({ id, ...(dto as any) } as DeepPartial<SeparationTask>);
    if (!entity) throw new NotFoundException('Separation task not found');
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Separation task not found');
  }

  async complete(id: string, completedBy?: number): Promise<SeparationTask> {
    const task = await this.findOne(id);
    if (task.status === SeparationTaskStatus.COMPLETED) return task;
    task.status = SeparationTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.completedBy = completedBy ?? task.completedBy ?? null;
    return this.repo.save(task);
  }
}

