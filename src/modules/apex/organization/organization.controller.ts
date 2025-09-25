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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';

@Controller('organizations')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating organization');
    }
  }

  @Get()
  async findAll(@Query() query: QueryOrganizationDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching organizations');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching organization');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating organization');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting organization');
    }
  }
}

