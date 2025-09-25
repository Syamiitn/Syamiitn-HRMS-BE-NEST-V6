import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { EmployeeDocument, DocumentType } from './entities/employee-document.entity';
import { CreateEmployeeDocumentDto } from './dto/create-employee-document.dto';
import { UpdateEmployeeDocumentDto } from './dto/update-employee-document.dto';
import { QueryEmployeeDocumentDto } from './dto/query-employee-document.dto';

@Injectable()
export class EmployeeDocumentService {
  constructor(
    @InjectRepository(EmployeeDocument)
    private readonly repo: Repository<EmployeeDocument>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private parseDate(dateStr?: string | null): Date | null {
    if (!dateStr) return null;
    return new Date(dateStr);
  }

  private validateDates(issueDate?: string, expiryDate?: string) {
    const issue = this.parseDate(issueDate);
    const expiry = this.parseDate(expiryDate);
    if (issue && isNaN(issue.getTime())) throw new BadRequestException('Invalid issueDate');
    if (expiry && isNaN(expiry.getTime())) throw new BadRequestException('Invalid expiryDate');
    if (issue && expiry && expiry < issue) {
      throw new BadRequestException('expiryDate cannot be before issueDate');
    }
  }

  async create(dto: CreateEmployeeDocumentDto): Promise<EmployeeDocument> {
    try {
      this.validateDates(dto.issueDate, dto.expiryDate);
      // Enforce unique per employeeId + title
      const duplicate = await this.repo.findOne({ where: { employeeId: dto.employeeId, title: dto.title } });
      if (duplicate) throw new ConflictException('Document title already exists for this employee');

      const entity = this.repo.create({
        ...dto,
        type: dto.type ?? DocumentType.OTHER,
      });
      return await this.repo.save(entity);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate employee document detected');
      throw new InternalServerErrorException('Failed to create employee document');
    }
  }

  async findAll(query: QueryEmployeeDocumentDto = {} as QueryEmployeeDocumentDto): Promise<EmployeeDocument[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ title: Like(term) });
        where.push({ fileName: Like(term) });
        where.push({ filePath: Like(term) });
      }

      const baseWhere: any = {};
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (typeof query.isVerified === 'boolean') baseWhere.isVerified = query.isVerified;
      if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;
      if (query.type) baseWhere.type = query.type;

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
      throw new InternalServerErrorException('Failed to fetch employee documents');
    }
  }

  async findOne(id: number): Promise<EmployeeDocument> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Employee document not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch employee document');
    }
  }

  async update(id: number, dto: UpdateEmployeeDocumentDto): Promise<EmployeeDocument> {
    try {
      this.validateDates(dto.issueDate, dto.expiryDate);

      // Check uniqueness if employeeId or title changed
      if (dto.employeeId || dto.title) {
        const current = await this.repo.findOne({ where: { id } });
        if (!current) throw new NotFoundException('Employee document not found');
        const employeeId = dto.employeeId ?? current.employeeId;
        const title = dto.title ?? current.title;
        const duplicate = await this.repo.findOne({ where: { employeeId, title } });
        if (duplicate && duplicate.id !== id) {
          throw new ConflictException('Document title already exists for this employee');
        }
      }

      const updated = await this.repo.preload({ id, ...dto });
      if (!updated) throw new NotFoundException('Employee document not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate employee document detected');
      throw new InternalServerErrorException('Failed to update employee document');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Employee document not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete employee document');
    }
  }
}

