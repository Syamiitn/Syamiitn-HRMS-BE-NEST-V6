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
import { ExitTaskService } from './exit-task.service';
import { CreateExitTaskDto } from './dto/create-exit-task.dto';
import { UpdateExitTaskDto } from './dto/update-exit-task.dto';
import { QueryExitTaskDto } from './dto/query-exit-task.dto';

@Controller('exit-tasks')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ExitTaskController {
  constructor(private readonly service: ExitTaskService) {}

  @Post()
  async create(@Body() dto: CreateExitTaskDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating exit task');
    }
  }

  @Get()
  async findAll(@Query() query: QueryExitTaskDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching exit tasks');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching exit task');
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExitTaskDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating exit task');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting exit task');
    }
  }
}

