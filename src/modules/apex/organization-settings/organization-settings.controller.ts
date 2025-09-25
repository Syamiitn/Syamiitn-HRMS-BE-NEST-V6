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
import { OrganizationSettingsService } from './organization-settings.service';
import { CreateOrganizationSettingsDto } from './dto/create-organization-settings.dto';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { QueryOrganizationSettingsDto } from './dto/query-organization-settings.dto';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class OrganizationSettingsController {
  constructor(private readonly service: OrganizationSettingsService) {}

  // Create settings for an organization
  @Post('organizations/:organizationId/settings')
  async createUnderOrg(@Param('organizationId') organizationId: string, @Body() dto: Omit<CreateOrganizationSettingsDto, 'organizationId'>) {
    try {
      return await this.service.create({ ...(dto as any), organizationId });
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating organization settings');
    }
  }

  // Upsert settings for an organization
  @Patch('organizations/:organizationId/settings')
  async upsertUnderOrg(@Param('organizationId') organizationId: string, @Body() dto: UpdateOrganizationSettingsDto) {
    try {
      return await this.service.upsertByOrganizationId(organizationId, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error saving organization settings');
    }
  }

  // Get settings for an organization
  @Get('organizations/:organizationId/settings')
  async getUnderOrg(@Param('organizationId') organizationId: string) {
    try {
      return await this.service.findByOrganizationId(organizationId);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching organization settings');
    }
  }

  // Flat CRUD
  @Post('organization-settings')
  async create(@Body() dto: CreateOrganizationSettingsDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating organization settings');
    }
  }

  @Get('organization-settings')
  async findAll(@Query() query: QueryOrganizationSettingsDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching organization settings');
    }
  }

  @Get('organization-settings/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching organization settings');
    }
  }

  @Patch('organization-settings/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationSettingsDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating organization settings');
    }
  }

  @Delete('organization-settings/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting organization settings');
    }
  }
}

