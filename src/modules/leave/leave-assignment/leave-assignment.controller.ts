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
import { LeaveAssignmentService } from './leave-assignment.service';
import { CreateLeaveAssignmentDto } from './dto/create-leave-assignment.dto';
import { UpdateLeaveAssignmentDto } from './dto/update-leave-assignment.dto';
import { QueryLeaveAssignmentDto } from './dto/query-leave-assignment.dto';

@Controller('leave-assignments')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class LeaveAssignmentController {
  constructor(private readonly service: LeaveAssignmentService) {}

  @Post()
  async create(@Body() dto: CreateLeaveAssignmentDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating leave assignment');
    }
  }

  @Get()
  async findAll(@Query() query: QueryLeaveAssignmentDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching leave assignments');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching leave assignment');
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLeaveAssignmentDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating leave assignment');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting leave assignment');
    }
  }
}

