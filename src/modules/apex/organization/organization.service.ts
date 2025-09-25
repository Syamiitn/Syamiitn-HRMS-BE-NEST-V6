import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Like, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
  ) {}

  private async ensureUniqueCode(orgCode: string, excludeId?: string) {
    const existing = await this.repo.findOne({ where: { orgCode } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('orgCode already exists');
    }
  }

  private async findExisting(id: string): Promise<Organization> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Organization not found');
    return entity;
  }

  private async assertGroupValid(groupId?: string | null, selfId?: string) {
    if (!groupId) return;
    if (selfId && groupId === selfId) throw new BadRequestException('groupId cannot equal organization id');
    // Ensure referenced group exists
    const root = await this.findExisting(groupId);
    // Detect cycles by walking up parents
    const visited = new Set<string>([selfId ?? '']);
    let cursor: Organization | null = root;
    let safety = 0;
    while (cursor?.groupId && safety++ < 50) {
      if (visited.has(cursor.groupId)) {
        throw new BadRequestException('groupId creates a circular reference');
      }
      visited.add(cursor.groupId);
      cursor = await this.repo.findOne({ where: { id: cursor.groupId } });
    }
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    await this.ensureUniqueCode(dto.orgCode);
    await this.assertGroupValid(dto.groupId ?? null);
    const entity = this.repo.create({ ...(dto as any) } as DeepPartial<Organization>);
    return this.repo.save(entity);
  }

  async findAll(query: QueryOrganizationDto): Promise<Organization[]> {
    const base: any = {};
    const where: any[] = [];
    if (query.groupId) base.groupId = query.groupId;
    if (typeof query.isActive === 'boolean') base.isActive = query.isActive;
    if (query.countryName) base.countryName = query.countryName;
    if (query.stateName) base.stateName = query.stateName;
    if (query.cityName) base.cityName = query.cityName;
    if (query.search) {
      const term = `%${query.search}%`;
      where.push({ orgName: Like(term) });
      where.push({ orgCode: Like(term) });
      where.push({ legalEntityName: Like(term) });
      where.push({ domainName: Like(term) });
      where.push({ industryType: Like(term) });
      where.push({ cityName: Like(term) });
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

  async findOne(id: string): Promise<Organization> {
    return this.findExisting(id);
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    if (dto.orgCode) await this.ensureUniqueCode(dto.orgCode, id);
    if (dto.groupId !== undefined) await this.assertGroupValid(dto.groupId ?? null, id);
    const entity = await this.repo.preload({ id, ...(dto as any) } as DeepPartial<Organization>);
    if (!entity) throw new NotFoundException('Organization not found');
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Organization not found');
  }
}

