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
import { ExitChecklistMasterService } from './exit-checklist-master.service';
import { CreateExitChecklistMasterDto } from './dto/create-exit-checklist-master.dto';
import { UpdateExitChecklistMasterDto } from './dto/update-exit-checklist-master.dto';
import { QueryExitChecklistMasterDto } from './dto/query-exit-checklist-master.dto';

@Controller('exit-checklist-masters')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ExitChecklistMasterController {
  constructor(private readonly service: ExitChecklistMasterService) {}

  @Post()
  async create(@Body() dto: CreateExitChecklistMasterDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating checklist');
    }
  }

  @Get()
  async findAll(@Query() query: QueryExitChecklistMasterDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching checklists');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching checklist');
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExitChecklistMasterDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating checklist');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting checklist');
    }
  }
}

