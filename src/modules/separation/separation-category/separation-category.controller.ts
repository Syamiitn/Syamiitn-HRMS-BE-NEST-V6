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
import { SeparationCategoryService } from './separation-category.service';
import { CreateSeparationCategoryDto } from './dto/create-separation-category.dto';
import { UpdateSeparationCategoryDto } from './dto/update-separation-category.dto';
import { QuerySeparationCategoryDto } from './dto/query-separation-category.dto';

@Controller('separation-categories')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class SeparationCategoryController {
  constructor(private readonly service: SeparationCategoryService) {}

  @Post()
  async create(@Body() dto: CreateSeparationCategoryDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating separation category');
    }
  }

  @Get()
  async findAll(@Query() query: QuerySeparationCategoryDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation categories');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation category');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSeparationCategoryDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating separation category');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting separation category');
    }
  }
}

