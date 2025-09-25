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
import { SeparationTaskService } from './separation-task.service';
import { CreateSeparationTaskDto } from './dto/create-separation-task.dto';
import { UpdateSeparationTaskDto } from './dto/update-separation-task.dto';
import { QuerySeparationTaskDto } from './dto/query-separation-task.dto';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class SeparationTaskController {
  constructor(private readonly service: SeparationTaskService) {}

  // Nested create: POST /separations/:separationId/tasks
  @Post('separations/:separationId/tasks')
  async createUnderSeparation(@Param('separationId') separationId: string, @Body() dto: Omit<CreateSeparationTaskDto, 'separationId'>) {
    try {
      return await this.service.create({ ...(dto as any), separationId });
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating separation task');
    }
  }

  // Flat create: POST /separation-tasks
  @Post('separation-tasks')
  async create(@Body() dto: CreateSeparationTaskDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating separation task');
    }
  }

  // Nested list: GET /separations/:separationId/tasks
  @Get('separations/:separationId/tasks')
  async findAllUnderSeparation(@Param('separationId') separationId: string, @Query() query: QuerySeparationTaskDto) {
    try {
      return await this.service.findAll({ ...query, separationId });
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation tasks');
    }
  }

  // Flat list: GET /separation-tasks
  @Get('separation-tasks')
  async findAll(@Query() query: QuerySeparationTaskDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation tasks');
    }
  }

  // Nested get: GET /separations/:separationId/tasks/:id
  @Get('separations/:separationId/tasks/:id')
  async findOneUnderSeparation(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation task');
    }
  }

  // Flat get: GET /separation-tasks/:id
  @Get('separation-tasks/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching separation task');
    }
  }

  // Nested update: PATCH /separations/:separationId/tasks/:id
  @Patch('separations/:separationId/tasks/:id')
  async updateUnderSeparation(@Param('separationId') separationId: string, @Param('id') id: string, @Body() dto: UpdateSeparationTaskDto) {
    try {
      return await this.service.update(id, { ...(dto as any), separationId });
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating separation task');
    }
  }

  // Flat update: PATCH /separation-tasks/:id
  @Patch('separation-tasks/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateSeparationTaskDto) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating separation task');
    }
  }

  // Nested delete: DELETE /separations/:separationId/tasks/:id
  @Delete('separations/:separationId/tasks/:id')
  @HttpCode(204)
  async removeUnderSeparation(@Param('id') id: string) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting separation task');
    }
  }

  // Flat delete: DELETE /separation-tasks/:id
  @Delete('separation-tasks/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting separation task');
    }
  }

  // Mark complete: POST /separation-tasks/:id/complete
  @Post('separation-tasks/:id/complete')
  async complete(@Param('id') id: string, @Body('completedBy') completedBy?: number) {
    try {
      return await this.service.complete(id, completedBy);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error completing separation task');
    }
  }
}

