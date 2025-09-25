import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { EmployeeBankAccount, AccountType } from './entities/employee-bank-account.entity';
import { CreateEmployeeBankAccountDto } from './dto/create-employee-bank-account.dto';
import { UpdateEmployeeBankAccountDto } from './dto/update-employee-bank-account.dto';
import { QueryEmployeeBankAccountDto } from './dto/query-employee-bank-account.dto';

@Injectable()
export class EmployeeBankAccountService {
  constructor(
    @InjectRepository(EmployeeBankAccount)
    private readonly repo: Repository<EmployeeBankAccount>,
  ) {}

  private isDuplicateError(err: any): boolean {
    // MySQL: ER_DUP_ENTRY, Postgres: 23505
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  async create(dto: CreateEmployeeBankAccountDto): Promise<EmployeeBankAccount> {
    try {
      // Check logical uniqueness: employeeId + accountNumber
      const exists = await this.repo.findOne({
        where: { employeeId: dto.employeeId, accountNumber: dto.accountNumber },
      });
      if (exists) {
        throw new ConflictException('Account number already exists for this employee');
      }
      const entity = this.repo.create({
        ...dto,
        accountType: dto.accountType ?? AccountType.SAVINGS,
      });
      return await this.repo.save(entity);
    } catch (err: any) {
      if (this.isDuplicateError(err)) {
        throw new ConflictException('Duplicate bank account detected');
      }
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to create employee bank account');
    }
  }

  async findAll(query: QueryEmployeeBankAccountDto = {} as QueryEmployeeBankAccountDto): Promise<EmployeeBankAccount[]> {
      try {
        const where: any[] = [];
        if (query.search) {
          const term = `%${query.search}%`;
          where.push({ accountHolderName: Like(term) });
          where.push({ accountNumber: Like(term) });
          where.push({ bankName: Like(term) });
        }

        const baseWhere: any = {};
        if (query.employeeId) baseWhere.employeeId = query.employeeId;
        if (query.bankName) baseWhere.bankName = query.bankName;
        if (query.accountType) baseWhere.accountType = query.accountType;
        if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;

        const options: any = {
          where: where.length ? where.map((w) => ({ ...w, ...baseWhere })) : baseWhere,
          order: { createdAt: 'DESC' },
        };

        if (query.page && query.limit) {
          options.skip = (query.page - 1) * query.limit;
          options.take = query.limit;
        }

        return await this.repo.find(options);
      } catch (err) {
        throw new InternalServerErrorException('Failed to fetch employee bank accounts');
      }
  }

  async findOne(id: number): Promise<EmployeeBankAccount> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Employee bank account not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch employee bank account');
    }
  }

  async update(id: number, dto: UpdateEmployeeBankAccountDto): Promise<EmployeeBankAccount> {
    try {
      // If accountNumber or employeeId change, enforce uniqueness
      if (dto.accountNumber || dto.employeeId) {
        const entity = await this.repo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException('Employee bank account not found');
        const employeeId = dto.employeeId ?? entity.employeeId;
        const accountNumber = dto.accountNumber ?? entity.accountNumber;
        const duplicate = await this.repo.findOne({ where: { employeeId, accountNumber } });
        if (duplicate && duplicate.id !== id) {
          throw new ConflictException('Account number already exists for this employee');
        }
      }

      const updated = await this.repo.preload({ id, ...dto });
      if (!updated) throw new NotFoundException('Employee bank account not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (this.isDuplicateError(err)) {
        throw new ConflictException('Duplicate bank account detected');
      }
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Failed to update employee bank account');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Employee bank account not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete employee bank account');
    }
  }
}

