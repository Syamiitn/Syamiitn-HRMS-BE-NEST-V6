import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { AssetAssignment, AssignmentStatus } from './entities/asset-assignment.entity';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';
import { QueryAssetAssignmentDto } from './dto/query-asset-assignment.dto';

@Injectable()
export class AssetAssignmentService {
  constructor(
    @InjectRepository(AssetAssignment)
    private readonly repo: Repository<AssetAssignment>,
  ) {}

  private isDuplicateError(err: any): boolean {
    return err?.code === 'ER_DUP_ENTRY' || err?.code === '23505';
  }

  private toDate(value?: string | Date | null): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  }

  private async ensureAssetNotActivelyAssigned(assetId: number, excludeId?: number) {
    const activeStatuses: AssignmentStatus[] = [AssignmentStatus.ACTIVE, AssignmentStatus.OVERDUE];
    const where: any = { assetId, status: activeStatuses.length === 1 ? activeStatuses[0] : undefined };
    const found = await this.repo.find({ where: [
      { assetId, status: AssignmentStatus.ACTIVE },
      { assetId, status: AssignmentStatus.OVERDUE },
    ] });
    const conflict = found.find((a) => (excludeId ? a.id !== excludeId : true));
    if (conflict) {
      throw new ConflictException('Asset is already actively assigned');
    }
  }

  async create(dto: CreateAssetAssignmentDto): Promise<AssetAssignment> {
    try {
      // Validate dates
      const assignedAt = this.toDate(dto.assignedAt) ?? new Date();
      const dueDate = this.toDate(dto.dueDate);
      if (dueDate && dueDate < assignedAt) {
        throw new BadRequestException('dueDate cannot be before assignedAt');
      }

      // Ensure asset has no active assignment
      const status = dto.status ?? AssignmentStatus.ACTIVE;
      if (status !== AssignmentStatus.RETURNED) {
        await this.ensureAssetNotActivelyAssigned(dto.assetId);
      }

      const entity = this.repo.create({
        ...dto,
        assignedAt,
        dueDate: dueDate ? dueDate.toISOString().substring(0, 10) : null,
        status,
      });
      return await this.repo.save(entity);
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof ConflictException) throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate asset assignment detected');
      throw new InternalServerErrorException('Failed to create asset assignment');
    }
  }

  async findAll(query: QueryAssetAssignmentDto = {} as QueryAssetAssignmentDto): Promise<AssetAssignment[]> {
    try {
      const where: any[] = [];
      if (query.search) {
        const term = `%${query.search}%`;
        where.push({ notes: Like(term) });
        where.push({ conditionOnAssign: Like(term) });
        where.push({ conditionOnReturn: Like(term) });
      }

      const baseWhere: any = {};
      if (query.assetId) baseWhere.assetId = query.assetId;
      if (query.employeeId) baseWhere.employeeId = query.employeeId;
      if (query.status) baseWhere.status = query.status;

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
      throw new InternalServerErrorException('Failed to fetch asset assignments');
    }
  }

  async findOne(id: number): Promise<AssetAssignment> {
    try {
      const entity = await this.repo.findOne({ where: { id } });
      if (!entity) throw new NotFoundException('Asset assignment not found');
      return entity;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch asset assignment');
    }
  }

  async update(id: number, dto: UpdateAssetAssignmentDto): Promise<AssetAssignment> {
    try {
      const current = await this.repo.findOne({ where: { id } });
      if (!current) throw new NotFoundException('Asset assignment not found');

      const assignedAt = this.toDate(dto.assignedAt ?? (current.assignedAt as any));
      const dueDate = this.toDate(dto.dueDate ?? (current.dueDate as any));
      if (dueDate && assignedAt && dueDate < assignedAt) {
        throw new BadRequestException('dueDate cannot be before assignedAt');
      }

      const nextStatus = dto.status ?? current.status;
      const nextAssetId = dto.assetId ?? current.assetId;

      if (nextStatus !== AssignmentStatus.RETURNED) {
        await this.ensureAssetNotActivelyAssigned(nextAssetId, id);
      }

      // If marking as returned and no returnedAt provided, set it to now
      let returnedAt: Date | null | undefined = this.toDate((dto as any)?.returnedAt);

      if (nextStatus === AssignmentStatus.RETURNED && !returnedAt) {
        returnedAt = new Date();
      }

      const updated = await this.repo.preload({
        id,
        ...dto,
        assignedAt: assignedAt ?? current.assignedAt,
        dueDate: dueDate ? dueDate.toISOString().substring(0, 10) : (current.dueDate as any),
        status: nextStatus,
        returnedAt: returnedAt ?? current.returnedAt,
      } as any);
      if (!updated) throw new NotFoundException('Asset assignment not found');
      return await this.repo.save(updated);
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException ||
        err instanceof ConflictException
      )
        throw err;
      if (this.isDuplicateError(err)) throw new ConflictException('Duplicate asset assignment detected');
      throw new InternalServerErrorException('Failed to update asset assignment');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.repo.delete(id);
      if (!result.affected) throw new NotFoundException('Asset assignment not found');
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete asset assignment');
    }
  }
}

