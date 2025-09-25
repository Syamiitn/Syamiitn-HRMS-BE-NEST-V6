import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { EmployeeStatutoryId, StatutoryIdType } from './entities/employee-statutory-id.entity';
import { CreateEmployeeStatutoryIdDto } from './dto/create-employee-statutory-id.dto';
import { UpdateEmployeeStatutoryIdDto } from './dto/update-employee-statutory-id.dto';
import { QueryEmployeeStatutoryIdDto } from './dto/query-employee-statutory-id.dto';

@Injectable()
export class EmployeeStatutoryIdService {
  constructor(
    @InjectRepository(EmployeeStatutoryId)
    private readonly repo: Repository<EmployeeStatutoryId>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private validateDates(issueDate?: string, expiryDate?: string) {
    const issue = this.toDate(issueDate);
    const expiry = this.toDate(expiryDate);
    if (issue && isNaN(issue.getTime())) throw new BadRequestException('Invalid issueDate');
    if (expiry && isNaN(expiry.getTime())) throw new BadRequestException('Invalid expiryDate');
    if (issue && expiry && expiry < issue) {
      throw new BadRequestException('expiryDate cannot be before issueDate');
    }
  }

  private async ensureUnique(dto: { employeeId: number; type?: StatutoryIdType; idNumber?: string }, excludeId?: number) {
    if (dto.idNumber) {
      const existingByNumber = await this.repo.findOne({ where: { idNumber: dto.idNumber } });
      if (existingByNumber && existingByNumber.id !== excludeId) {
        throw new ConflictException('idNumber already exists');
      }
    }
    if (dto.type) {
      const existingByPair = await this.repo.findOne({ where: { employeeId: dto.employeeId, type: dto.type } });
      if (existingByPair && existingByPair.id !== excludeId) {
        throw new ConflictException('Employee already has an ID of this type');
      }
    }
  }

  async create(dto: CreateEmployeeStatutoryIdDto): Promise<any> {
    try {
      this.validateDates(dto.issueDate, dto.expiryDate);
      await this.ensureUnique({ employeeId: dto.employeeId, type: dto.type ?? StatutoryIdType.OTHER, idNumber: dto.idNumber });
      const entity = this.repo.create({
        ...dto,
        type: dto.type ?? StatutoryIdType.OTHER,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate statutory id detected');
      throw new InternalServerErrorException('Failed to create statutory id');
    }
  }

  async findAll(query: QueryEmployeeStatutoryIdDto = {} as QueryEmployeeStatutoryIdDto): Promise<EmployeeStatutoryId[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ idNumber: Like(term) });
        where.push({ issuedBy: Like(term) });
        where.push({ notes: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.type) baseWhere.type = query.type;
      if (query.country) baseWhere.country = query.country;
      if (typeof query.isVerified === 'boolean') baseWhere.isVerified = query.isVerified;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.issueFrom || query.issueTo) {
        const from = query.issueFrom ?? '0001-01-01';
        const to = query.issueTo ?? '9999-12-31';
        baseWhere.issueDate = Between(from, to);
      }
      if (query.expiryFrom || query.expiryTo) {
        const from = query.expiryFrom ?? '0001-01-01';
        const to = query.expiryTo ?? '9999-12-31';
        baseWhere.expiryDate = Between(from, to);
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
      throw new InternalServerErrorException('Failed to fetch statutory ids');
    }
  }

  async findOne(id: number): Promise<EmployeeStatutoryId> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Statutory id not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch statutory id');
    }
  }

  async update(id: number, dto: UpdateEmployeeStatutoryIdDto): Promise<EmployeeStatutoryId> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Statutory id not found');

      this.validateDates(dto.issueDate ?? current.issueDate ?? undefined, dto.expiryDate ?? current.expiryDate ?? undefined);
      if (dto.idNumber || dto.type) {
        await this.ensureUnique(
          {
            employeeId: current.employeeId,
            type: dto.type ?? current.type,
            idNumber: dto.idNumber,
          },
          id,
        );
      }

      const updated = await this.repo.preload({ id, ...dto } as any);
      if (!updated) throw new NotFoundException('Statutory id not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate statutory id detected');
      throw new InternalServerErrorException('Failed to update statutory id');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Statutory id not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete statutory id');
    }
  }
}

