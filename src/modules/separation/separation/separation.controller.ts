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
import { SeparationService } from './separation.service';
import { CreateSeparationDto } from './dto/create-separation.dto';
import { UpdateSeparationDto } from './dto/update-separation.dto';
import { QuerySeparationDto } from './dto/query-separation.dto';

@Controller('separations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class SeparationController {
  constructor(private readonly service: SeparationService) {}

  @Post()
  async create(@Body() dto: CreateSeparationDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating separation');
    }
  }

  @Get()
  async findAll(@Query() query: QuerySeparationDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separations');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSeparationDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating separation');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting separation');
    }
  }
}
