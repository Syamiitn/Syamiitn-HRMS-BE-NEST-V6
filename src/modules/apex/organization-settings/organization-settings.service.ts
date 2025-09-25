import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, Repository } from 'typeorm';
import { OrganizationSettings } from './entities/organization-settings.entity';
import { CreateOrganizationSettingsDto } from './dto/create-organization-settings.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { QueryOrganizationSettingsDto } from './dto/query-organization-settings.dto';
import { Organization } from '../organization/entities/organization.entity';

@Injectable()
export class OrganizationSettingsService {
  constructor(
    @InjectRepository(OrganizationSettings)
    private readonly repo: Repository<OrganizationSettings>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private validateFiscalRange(start?: string, end?: string) {
    if (!start && !end) return;
    const s = this.toDate(start);
    const e = this.toDate(end);
    if (s && isNaN(s.getTime())) throw new BadRequestException('Invalid fiscalYearStartDate');
    if (e && isNaN(e.getTime())) throw new BadRequestException('Invalid fiscalYearEndDate');
    if (s && e && e < s) throw new BadRequestException('fiscalYearEndDate cannot be before fiscalYearStartDate');
  }

  private validateWorkingDays(csv?: string) {
    if (!csv) return;
    const parts = csv.split(',');
    const valid = new Set(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
    const seen = new Set<string>();
    for (const p of parts) {
      if (!valid.has(p)) throw new BadRequestException('Invalid working day code: ' + p);
      if (seen.has(p)) throw new BadRequestException('Duplicate working day code: ' + p);
      seen.add(p);
    }
    if (parts.length > 7) throw new BadRequestException('Too many working day codes');
  }

  private async ensureOrgExists(organizationId: string) {
    const org = await this.orgRepo.findOne({ where: { id: organizationId } });
    if (!org) throw new NotFoundException('Organization not found');
  }

  async create(dto: CreateOrganizationSettingsDto): Promise<OrganizationSettings> {
    await this.ensureOrgExists(dto.organizationId);
    const existing = await this.repo.findOne({ where: { organizationId: dto.organizationId } });
    if (existing) throw new ConflictException('Settings already exist for this organization');
    this.validateWorkingDays(dto.workingDaysCsv);
    this.validateFiscalRange(dto.fiscalYearStartDate, dto.fiscalYearEndDate);
    const entity = this.repo.create({ ...(dto as any) } as DeepPartial<OrganizationSettings>);
    return this.repo.save(entity);
  }

  async findAll(query: QueryOrganizationSettingsDto): Promise<OrganizationSettings[]> {
    const base: any = {};
    if (query.organizationId) base.organizationId = query.organizationId;
    if (query.reportingCycle) base.reportingCycle = query.reportingCycle;
    if (query.updatedFrom || query.updatedTo) {
      const from = query.updatedFrom ?? '0001-01-01';
      const to = query.updatedTo ?? '9999-12-31';
      base.updatedAt = Between(from, to);
    }
    const orderByField = query.sortBy ?? 'updatedAt';
    const orderByDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;
    const options: any = { where: base, order: { [orderByField]: orderByDir } };
    if (query.page && query.limit) {
      options.skip = (query.page - 1) * query.limit;
      options.take = query.limit;
    }
    return this.repo.find(options);
  }

  async findOne(id: string): Promise<OrganizationSettings> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Organization settings not found');
    return entity;
  }

  async findByOrganizationId(organizationId: string): Promise<OrganizationSettings> {
    const entity = await this.repo.findOne({ where: { organizationId } });
    if (!entity) throw new NotFoundException('Organization settings not found');
    return entity;
  }

  async update(id: string, dto: UpdateOrganizationSettingsDto): Promise<OrganizationSettings> {
    if (dto.organizationId) await this.ensureOrgExists(dto.organizationId);
    this.validateWorkingDays(dto.workingDaysCsv);
    this.validateFiscalRange(dto.fiscalYearStartDate, dto.fiscalYearEndDate);
    const entity = await this.repo.preload({ id, ...(dto as any) } as DeepPartial<OrganizationSettings>);
    if (!entity) throw new NotFoundException('Organization settings not found');
    return this.repo.save(entity);
  }

  async upsertByOrganizationId(organizationId: string, dto: UpdateOrganizationSettingsDto): Promise<OrganizationSettings> {
    await this.ensureOrgExists(organizationId);
    this.validateWorkingDays(dto.workingDaysCsv);
    this.validateFiscalRange(dto.fiscalYearStartDate, dto.fiscalYearEndDate);
    const existing = await this.repo.findOne({ where: { organizationId } });
    if (!existing) {
      const created = this.repo.create({ organizationId, ...(dto as any) } as DeepPartial<OrganizationSettings>);
      return this.repo.save(created);
    }
    const entity = await this.repo.preload({ id: existing.id, organizationId, ...(dto as any) } as DeepPartial<OrganizationSettings>);
    return this.repo.save(entity!);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Organization settings not found');
  }
}

