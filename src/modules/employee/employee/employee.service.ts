import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Employee, EmployeeStatus } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private validateDates(hireDateStr: string, dobStr?: string) {
    const hireDate = this.toDate(hireDateStr);
    if (!hireDate || isNaN(hireDate.getTime())) throw new BadRequestException('Invalid hireDate');
    const today = new Date();
    const todayYMD = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    if (hireDate > todayYMD) throw new BadRequestException('hireDate cannot be in the future');
    if (dobStr) {
      const dob = this.toDate(dobStr);
      if (!dob || isNaN(dob.getTime())) throw new BadRequestException('Invalid dateOfBirth');
      if (dob > hireDate) throw new BadRequestException('dateOfBirth cannot be after hireDate');
    }
  }

  private async ensureUniqueFields(dto: { email?: string; employeeCode?: string }, excludeId?: number) {
    if (dto.email) {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Email already exists');
      }
    }
    if (dto.employeeCode) {
      const existing = await this.repo.findOne({ where: { employeeCode: dto.employeeCode } });
      if (existing && existing.id !== excludeId) {
        throw new ConflictException('Employee code already exists');
      }
    }
  }

  async create(dto: CreateEmployeeDto): Promise<any> {
    try {
      this.validateDates(dto.hireDate, dto.dateOfBirth);
      await this.ensureUniqueFields({ email: dto.email, employeeCode: dto.employeeCode });
      const entity = this.repo.create({
        ...dto,
        status: dto.status ?? EmployeeStatus.ACTIVE,
      } as any);
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate employee detected');
      throw new InternalServerErrorException('Failed to create employee');
    }
  }

  async findAll(query: QueryEmployeeDto = {} as QueryEmployeeDto): Promise<Employee[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ firstName: Like(term) });
        where.push({ lastName: Like(term) });
        where.push({ email: Like(term) });
        where.push({ employeeCode: Like(term) });
        where.push({ phone: Like(term) });
      }

      const baseWhere: any = {};
      if (query.departmentId) baseWhere.departmentId = query.departmentId;
      if (query.managerId) baseWhere.managerId = query.managerId;
      if (query.status) baseWhere.status = query.status;
      if (query.employmentType) baseWhere.employmentType = query.employmentType;
      if (query.gender) baseWhere.gender = query.gender;

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
      throw new InternalServerErrorException('Failed to fetch employees');
    }
  }

  async findOne(id: number): Promise<Employee> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Employee not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch employee');
    }
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Employee not found');

      const hireDate = dto.hireDate ?? current.hireDate;
      const dob = dto.dateOfBirth ?? current.dateOfBirth ?? undefined;
      this.validateDates(hireDate, dob as any);

      if (dto.email || dto.employeeCode) {
        await this.ensureUniqueFields({ email: dto.email, employeeCode: dto.employeeCode }, id);
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        hireDate,
        dateOfBirth: (dob as any) ?? current.dateOfBirth,
      } as any);
      if (!updated) throw new NotFoundException('Employee not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate employee detected');
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Employee not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete employee');
    }
  }
}

