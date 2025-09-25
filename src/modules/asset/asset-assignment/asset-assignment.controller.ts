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
import { AssetAssignmentService } from './asset-assignment.service';
import { CreateAssetAssignmentDto } from './dto/create-asset-assignment.dto';
import { UpdateAssetAssignmentDto } from './dto/update-asset-assignment.dto';
import { QueryAssetAssignmentDto } from './dto/query-asset-assignment.dto';

@Controller('asset-assignments')
@UsePipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
)
export class AssetAssignmentController {
  constructor(private readonly service: AssetAssignmentService) {}

  @Post()
  async create(@Body() dto: CreateAssetAssignmentDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating asset assignment');
    }
  }

  @Get()
  async findAll(@Query() query: QueryAssetAssignmentDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching asset assignments');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching asset assignment');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssetAssignmentDto,
  ) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating asset assignment');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting asset assignment');
    }
  }
}

