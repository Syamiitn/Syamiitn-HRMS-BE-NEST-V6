import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository, DeepPartial } from 'typeorm';
import { Separation, SeparationStatus } from './entities/separation.entity';
import { CreateSeparationDto } from './dto/create-separation.dto';
import { UpdateSeparationDto } from './dto/update-separation.dto';
import { QuerySeparationDto } from './dto/query-separation.dto';

@Injectable()
export class SeparationService {
  constructor(
    @InjectRepository(Separation)
    private readonly repo: Repository<Separation>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private toYMD(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private validateDates(dto: { intendedDate?: string; intendedLastWorkingDate?: string; approvedLastWorkingDate?: string; noticePeriodStartDate?: string; noticePeriodEndDate?: string }) {
    const intended = this.toDate(dto.intendedDate);
    const intendedLast = this.toDate(dto.intendedLastWorkingDate);
    const approvedLast = this.toDate(dto.approvedLastWorkingDate);
    const npStart = this.toDate(dto.noticePeriodStartDate);
    const npEnd = this.toDate(dto.noticePeriodEndDate);

    if (!intended || isNaN(intended.getTime())) throw new BadRequestException('Invalid intendedDate');
    if (!intendedLast || isNaN(intendedLast.getTime()))
      throw new BadRequestException('Invalid intendedLastWorkingDate');
    if (intendedLast < intended)
      throw new BadRequestException('intendedLastWorkingDate cannot be before intendedDate');
    if (approvedLast && approvedLast < intended)
      throw new BadRequestException('approvedLastWorkingDate cannot be before intendedDate');
    if (npStart && npEnd && npEnd < npStart)
      throw new BadRequestException('noticePeriodEndDate cannot be before noticePeriodStartDate');
  }

  async create(dto: CreateSeparationDto): Promise<Separation> {
    try {
      const status = dto.status ?? SeparationStatus.DRAFT;
      this.validateDates({
        intendedDate: dto.intendedDate,
        intendedLastWorkingDate: dto.intendedLastWorkingDate,
        approvedLastWorkingDate: dto.approvedLastWorkingDate,
        noticePeriodStartDate: dto.noticePeriodStartDate,
        noticePeriodEndDate: dto.noticePeriodEndDate,
      });

      const entity = this.repo.create({ ...(dto as any), status } as DeepPartial<Separation>);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      )
        throw err;
      throw new InternalServerErrorException('Failed to create separation');
    }
  }

  async findAll(query: QuerySeparationDto): Promise<Separation[]> {
    const where: any[] = [];
    const base: any = {};

    if (query.employeeId) base.employeeId = query.employeeId;
    if (query.managerId) base.managerId = query.managerId;
    if (query.status) base.status = query.status;
    if (query.assetStatus) base.assetStatus = query.assetStatus;
    if (query.reasonId) base.reasonId = query.reasonId;

    if (query.intendedFrom || query.intendedTo) {
      const from = query.intendedFrom ?? '0001-01-01';
      const to = query.intendedTo ?? '9999-12-31';
      base.intendedDate = Between(from, to);
    }

    if (query.lastWorkingFrom || query.lastWorkingTo) {
      const from = query.lastWorkingFrom ?? '0001-01-01';
      const to = query.lastWorkingTo ?? '9999-12-31';
      base.intendedLastWorkingDate = Between(from, to);
    }

    if (query.search) {
      const term = `%${query.search}%`;
      where.push({ reasonNote: Like(term) });
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

  async findOne(id: string): Promise<Separation> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Separation not found');
    return entity;
  }

  async update(id: string, dto: UpdateSeparationDto): Promise<Separation> {
    this.validateDates({
      intendedDate: dto.intendedDate,
      intendedLastWorkingDate: dto.intendedLastWorkingDate,
      approvedLastWorkingDate: dto.approvedLastWorkingDate,
      noticePeriodStartDate: dto.noticePeriodStartDate,
      noticePeriodEndDate: dto.noticePeriodEndDate,
    });

    const entity = await this.repo.preload({ id, ...(dto as any) } as DeepPartial<Separation>);
    if (!entity) throw new NotFoundException('Separation not found');
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Separation not found');
  }
}
