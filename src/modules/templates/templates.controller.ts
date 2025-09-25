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
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';
import { RenderTemplateDto } from './dto/render-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../apex/user/entities/user.entity';

@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() dto: CreateTemplateDto, @Req() req: any) {
    try {
      return await this.service.create(dto, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating template');
    }
  }

  @Get()
  async findAll(@Query() query: QueryTemplateDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching templates');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching template');
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto, @Req() req: any) {
    try {
      return await this.service.update(id, dto, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating template');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string, @Req() req: any) {
    try {
      await this.service.remove(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting template');
    }
  }

  // Render and export
  @Post(':id/render')
  async render(@Param('id') id: string, @Body() dto: RenderTemplateDto, @Res() res: any) {
    try {
      const tpl = await this.service.findOne(id);
      const content = this.service.renderContent(tpl, dto.data, dto.failOnMissing);
      const exported = await this.service.export(tpl, content, dto.exportAs);
      res.setHeader('Content-Type', exported.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${exported.fileName}"`);
      return res.end(exported.buffer);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error rendering template');
    }
  }
}

