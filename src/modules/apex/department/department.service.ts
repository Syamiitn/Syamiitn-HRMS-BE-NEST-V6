import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      if (!createDepartmentDto.name) {
        throw new BadRequestException('Department name is required');
      }

      const department = this.departmentRepo.create(createDepartmentDto);
      return await this.departmentRepo.save(department);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(): Promise<Department[]> {
    try {
      return await this.departmentRepo.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch departments');
    }
  }

  async findOne(id: number): Promise<Department> {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('Invalid department ID');
      }

      const department = await this.departmentRepo.findOne({ where: { id } });
      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }

      return department;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('Invalid department ID');
      }

      const department = await this.departmentRepo.findOne({ where: { id } });
      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }

      const updated = Object.assign(department, updateDepartmentDto);
      return await this.departmentRepo.save(updated);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('Invalid department ID');
      }

      const department = await this.departmentRepo.findOne({ where: { id } });
      if (!department) {
        throw new NotFoundException(`Department with ID ${id} not found`);
      }

      await this.departmentRepo.delete(id);
      return { message: `Department with ID ${id} removed successfully` };
    } catch (error) {
      throw error;
    }
  }
}
