import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SeparationReasonService } from './separation-reason.service';
import { CreateSeparationReasonDto } from './dto/create-separation-reason.dto';
import { UpdateSeparationReasonDto } from './dto/update-separation-reason.dto';
import { QuerySeparationReasonDto } from './dto/query-separation-reason.dto';

@Controller('separation-reasons')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class SeparationReasonController {
  constructor(private readonly service: SeparationReasonService) {}

  @Post()
  async create(@Body() dto: CreateSeparationReasonDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating separation reason');
    }
  }

  @Get()
  async findAll(@Query() query: QuerySeparationReasonDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation reasons');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation reason');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSeparationReasonDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating separation reason');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting separation reason');
    }
  }
}

