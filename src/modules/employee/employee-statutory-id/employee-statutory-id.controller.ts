import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployeeStatutoryIdService } from './employee-statutory-id.service';
import { CreateEmployeeStatutoryIdDto } from './dto/create-employee-statutory-id.dto';
import { UpdateEmployeeStatutoryIdDto } from './dto/update-employee-statutory-id.dto';
import { QueryEmployeeStatutoryIdDto } from './dto/query-employee-statutory-id.dto';

@Controller('employee-statutory-ids')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class EmployeeStatutoryIdController {
  constructor(private readonly service: EmployeeStatutoryIdService) {}

  @Post()
  async create(@Body() dto: CreateEmployeeStatutoryIdDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating statutory id');
    }
  }

  @Get()
  async findAll(@Query() query: QueryEmployeeStatutoryIdDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching statutory ids');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching statutory id');
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeStatutoryIdDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating statutory id');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting statutory id');
    }
  }
}

