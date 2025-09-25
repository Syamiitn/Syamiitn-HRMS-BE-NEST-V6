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
import { AttendanceTimeEntryService } from './attendance-time-entry.service';
import { CreateAttendanceTimeEntryDto } from './dto/create-attendance-time-entry.dto';
import { UpdateAttendanceTimeEntryDto } from './dto/update-attendance-time-entry.dto';
import { QueryAttendanceTimeEntryDto } from './dto/query-attendance-time-entry.dto';

@Controller('attendance-time-entries')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AttendanceTimeEntryController {
  constructor(private readonly service: AttendanceTimeEntryService) {}

  @Post()
  async create(@Body() dto: CreateAttendanceTimeEntryDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating attendance time entry');
    }
  }

  @Get()
  async findAll(@Query() query: QueryAttendanceTimeEntryDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching attendance time entries');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching attendance time entry');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceTimeEntryDto,
  ) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating attendance time entry');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting attendance time entry');
    }
  }
}

