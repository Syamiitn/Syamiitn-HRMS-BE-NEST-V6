import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { EmployeeAddress, AddressType } from './entities/employee-address.entity';
import { CreateEmployeeAddressDto } from './dto/create-employee-address.dto';
import { UpdateEmployeeAddressDto } from './dto/update-employee-address.dto';
import { QueryEmployeeAddressDto } from './dto/query-employee-address.dto';

@Injectable()
export class EmployeeAddressService {
  constructor(
    @InjectRepository(EmployeeAddress)
    private readonly repo: Repository<EmployeeAddress>,
  ) {}

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private validateDates(fromDate?: string, toDate?: string) {
    const from = this.toDate(fromDate ?? undefined);
    const to = this.toDate(toDate ?? undefined);
    if (from && isNaN(from.getTime())) throw new BadRequestException('Invalid fromDate');
    if (to && isNaN(to.getTime())) throw new BadRequestException('Invalid toDate');
    if (from && to && to < from) throw new BadRequestException('toDate cannot be before fromDate');
  }

  private async ensureUniquePrimary(
    employeeId: number,
    isPrimary?: boolean,
    type?: AddressType,
    excludeId?: number,
  ) {
    if (!isPrimary) return;
    const qb = this.repo
      .createQueryBuilder('a')
      .where('a.employeeId = :employeeId', { employeeId })
      .andWhere('a.isPrimary = :isPrimary', { isPrimary: true });
    if (type) qb.andWhere('a.type = :type', { type });
    if (excludeId) qb.andWhere('a.id != :excludeId', { excludeId });
    const exists = await qb.getOne();
    if (exists) {
      throw new ConflictException('Primary address already exists for this employee and type');
    }
  }

  async create(dto: CreateEmployeeAddressDto): Promise<any> {
    try {
      this.validateDates(dto.fromDate, dto.toDate);
      await this.ensureUniquePrimary(dto.employeeId, dto.isPrimary, dto.type ?? AddressType.OTHER);
      const entity = this.repo.create({
        ...dto,
        type: dto.type ?? AddressType.OTHER,
      } as any);
      return await this.repo.save(entity);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create employee address');
    }
  }

  async findAll(query: QueryEmployeeAddressDto = {} as QueryEmployeeAddressDto): Promise<EmployeeAddress[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ line1: Like(term) });
        where.push({ line2: Like(term) });
        where.push({ city: Like(term) });
        where.push({ state: Like(term) });
        where.push({ postalCode: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.type) baseWhere.type = query.type;
      if (query.city) baseWhere.city = query.city;
      if (query.state) baseWhere.state = query.state;
      if (query.country) baseWhere.country = query.country;
      if (typeof query.isPrimary === 'boolean') baseWhere.isPrimary = query.isPrimary;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.fromFrom || query.fromTo) {
        const from = query.fromFrom ?? '0001-01-01';
        const to = query.fromTo ?? '9999-12-31';
        baseWhere.fromDate = Between(from, to);
      }
      if (query.toFrom || query.toTo) {
        const from = query.toFrom ?? '0001-01-01';
        const to = query.toTo ?? '9999-12-31';
        baseWhere.toDate = Between(from, to);
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
      throw new InternalServerErrorException('Failed to fetch employee addresses');
    }
  }

  async findOne(id: number): Promise<EmployeeAddress> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Employee address not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch employee address');
    }
  }

  async update(id: number, dto: UpdateEmployeeAddressDto): Promise<EmployeeAddress> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Employee address not found');

      const fromDate = dto.fromDate ?? current.fromDate ?? undefined;
      const toDate = dto.toDate ?? current.toDate ?? undefined;
      this.validateDates(fromDate as any, toDate as any);

      const isPrimary = dto.isPrimary ?? current.isPrimary;
      const type = dto.type ?? current.type;
      await this.ensureUniquePrimary(current.employeeId, isPrimary, type, id);

      const updated = await this.repo.preload({
        id,
        ...dto,
        fromDate: (fromDate as any) ?? current.fromDate,
        toDate: (toDate as any) ?? current.toDate,
        isPrimary,
        type,
      } as any);
      if (!updated) throw new NotFoundException('Employee address not found');
      return await this.repo.save(updated);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      throw new InternalServerErrorException('Failed to update employee address');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Employee address not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete employee address');
    }
  }
}

