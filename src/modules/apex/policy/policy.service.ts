import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, Repository } from 'typeorm';
import { Policy } from './entities/policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { QueryPolicyDto } from './dto/query-policy.dto';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private readonly repo: Repository<Policy>,
  ) {}

  private async ensureUniqueCode(policyCode: string, excludeId?: string) {
    const existing = await this.repo.findOne({ where: { policyCode } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('policyCode already exists');
    }
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private validateRange(from?: string, to?: string) {
    if (!from && !to) return;
    const s = this.toDate(from);
    const e = this.toDate(to);
    if (s && isNaN(s.getTime())) throw new BadRequestException('Invalid effectiveFrom');
    if (e && isNaN(e.getTime())) throw new BadRequestException('Invalid effectiveTo');
    if (s && e && e < s) throw new BadRequestException('effectiveTo cannot be before effectiveFrom');
  }

  private normalizeRoles(roles?: string[] | null): string[] | null | undefined {
    if (!roles) return roles as any;
    const clean = Array.from(new Set(roles.map((r) => String(r).trim()).filter(Boolean)));
    return clean.length ? clean : [];
  }

  async create(dto: CreatePolicyDto): Promise<Policy> {
    await this.ensureUniqueCode(dto.policyCode);
    this.validateRange(dto.effectiveFrom, dto.effectiveTo);
    const entity = this.repo.create({
      ...(dto as any),
      visibleToRoles: this.normalizeRoles(dto.visibleToRoles) as any,
    } as DeepPartial<Policy>);
    return this.repo.save(entity);
  }

  async findAll(query: QueryPolicyDto): Promise<Policy[]> {
    const qb = this.repo.createQueryBuilder('p');

    if (query.category) qb.andWhere('p.category = :category', { category: query.category });
    if (typeof query.isMandatory === 'boolean') qb.andWhere('p.isMandatory = :isMandatory', { isMandatory: query.isMandatory });
    if (typeof query.isActive === 'boolean') qb.andWhere('p.isActive = :isActive', { isActive: query.isActive });
    if (query.search) {
      const term = `%${query.search}%`;
      qb.andWhere('(p.title LIKE :term OR p.policyCode LIKE :term OR p.description LIKE :term)', { term });
    }
    if (query.visibleToRole) {
      qb.andWhere('JSON_CONTAINS(p.visibleToRoles, JSON_QUOTE(:role), "$") = 1', { role: query.visibleToRole });
    }

    if (query.effectiveFromFrom || query.effectiveFromTo) {
      qb.andWhere('p.effectiveFrom BETWEEN :effFromA AND :effFromB', {
        effFromA: query.effectiveFromFrom ?? '0001-01-01',
        effFromB: query.effectiveFromTo ?? '9999-12-31',
      });
    }
    if (query.effectiveToFrom || query.effectiveToTo) {
      qb.andWhere('p.effectiveTo BETWEEN :effToA AND :effToB', {
        effToA: query.effectiveToFrom ?? '0001-01-01',
        effToB: query.effectiveToTo ?? '9999-12-31',
      });
    }

    const orderByField = query.sortBy ?? 'createdAt';
    const orderByDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;
    qb.orderBy(`p.${orderByField}`, orderByDir);

    if (query.page && query.limit) {
      qb.skip((query.page - 1) * query.limit).take(query.limit);
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Policy> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Policy not found');
    return entity;
  }

  async update(id: string, dto: UpdatePolicyDto): Promise<Policy> {
    if (dto.policyCode) await this.ensureUniqueCode(dto.policyCode, id);
    this.validateRange(dto.effectiveFrom, dto.effectiveTo);
    const entity = await this.repo.preload({
      id,
      ...(dto as any),
      visibleToRoles: this.normalizeRoles(dto.visibleToRoles) as any,
    } as DeepPartial<Policy>);
    if (!entity) throw new NotFoundException('Policy not found');
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Policy not found');
  }
}

