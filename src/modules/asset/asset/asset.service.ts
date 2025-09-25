import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, DeepPartial } from 'typeorm';
import { Asset, AssetStatus } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { QueryAssetDto } from './dto/query-asset.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  private async ensureUnique(dto: { assetTag?: string; serialNumber?: string }, idToExclude?: number) {
    if (dto.assetTag) {
      const exists = await this.assetRepository.findOne({
        where: idToExclude
          ? { assetTag: dto.assetTag, id: idToExclude as any }
          : { assetTag: dto.assetTag },
        withDeleted: false as any,
      } as any);
      if (exists && exists.id !== idToExclude) {
        throw new ConflictException('Asset with this assetTag already exists');
      }
    }
    if (dto.serialNumber) {
      const exists = await this.assetRepository.findOne({
        where: idToExclude
          ? { serialNumber: dto.serialNumber, id: idToExclude as any }
          : { serialNumber: dto.serialNumber },
        withDeleted: false as any,
      } as any);
      if (exists && exists.id !== idToExclude) {
        throw new ConflictException('Asset with this serialNumber already exists');
      }
    }
  }

  async create(dto: CreateAssetDto): Promise<Asset> {
    await this.ensureUnique({ assetTag: dto.assetTag, serialNumber: dto.serialNumber });
    const createPayload: DeepPartial<Asset> = {
      ...dto,
      // TypeORM maps decimal columns to string; coerce number -> string
      purchaseCost:
        dto.purchaseCost !== undefined && dto.purchaseCost !== null
          ? dto.purchaseCost.toFixed(2)
          : undefined,
      status: dto.status ?? AssetStatus.AVAILABLE,
    };
    const asset = this.assetRepository.create(createPayload);
    return this.assetRepository.save(asset);
  }

  async findAll(query: QueryAssetDto = {} as QueryAssetDto): Promise<Asset[]> {
    const where: any[] = [];
    if (query.search) {
      const term = `%${query.search}%`;
      where.push({ name: Like(term) });
      where.push({ assetTag: Like(term) });
      where.push({ serialNumber: Like(term) });
    }

    const baseWhere: any = {};
    if (query.category) baseWhere.category = query.category;
    if (query.status) baseWhere.status = query.status;
    if (typeof query.isActive === 'boolean') baseWhere.isActive = query.isActive;

    const orderByField = query.sortBy ?? 'createdAt';
    const orderByDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;

    const options: any = {
      where: where.length ? where.map((w) => ({ ...w, ...baseWhere })) : baseWhere,
      order: { [orderByField]: orderByDir },
    };

    if (query.page && query.limit) {
      options.skip = (query.page - 1) * query.limit;
      options.take = query.limit;
    }

    return this.assetRepository.find(options);
  }

  async findOne(id: number): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async update(id: number, dto: UpdateAssetDto): Promise<Asset> {
    if (dto.assetTag || dto.serialNumber) {
      await this.ensureUnique(
        { assetTag: dto.assetTag, serialNumber: dto.serialNumber },
        id,
      );
    }
    // Coerce decimal field to string to match entity typing
    const updatePayload: DeepPartial<Asset> = {
      id,
      ...dto,
      purchaseCost:
        dto.purchaseCost !== undefined && dto.purchaseCost !== null
          ? dto.purchaseCost.toFixed(2)
          : undefined,
    };
    const entity = await this.assetRepository.preload(updatePayload);
    if (!entity) throw new NotFoundException('Asset not found');
    return this.assetRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const result = await this.assetRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Asset not found');
  }
}
