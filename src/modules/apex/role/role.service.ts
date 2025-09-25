import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const exists = await this.roleRepository.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('Role with this name already exists');
    }
    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.preload({ id, ...dto });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const result = await this.roleRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Role not found');
    }
  }
}

