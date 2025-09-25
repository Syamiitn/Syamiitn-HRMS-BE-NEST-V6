import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    try {
      return await this.departmentService.create(createDepartmentDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create department');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.departmentService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to fetch departments');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const department = await this.departmentService.findOne(+id);
      if (!department) {
        throw new NotFoundException(`Department with id ${id} not found`);
      }
      return department;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message || 'Failed to fetch department');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    try {
      const updated = await this.departmentService.update(+id, updateDepartmentDto);
      if (!updated) {
        throw new NotFoundException(`Department with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(error.message || 'Failed to update department');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.departmentService.remove(+id);
      if (!result) {
        throw new NotFoundException(`Department with id ${id} not found`);
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message || 'Failed to delete department');
    }
  }
}
