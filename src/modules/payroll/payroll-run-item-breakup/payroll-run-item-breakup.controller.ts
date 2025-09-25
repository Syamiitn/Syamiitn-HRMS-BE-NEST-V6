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
import { PayrollRunItemBreakupService } from './payroll-run-item-breakup.service';
import { CreatePayrollRunItemBreakupDto } from './dto/create-payroll-run-item-breakup.dto';
import { UpdatePayrollRunItemBreakupDto } from './dto/update-payroll-run-item-breakup.dto';
import { QueryPayrollRunItemBreakupDto } from './dto/query-payroll-run-item-breakup.dto';

@Controller('payroll-run-item-breakups')
@UsePipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
)
export class PayrollRunItemBreakupController {
  constructor(private readonly service: PayrollRunItemBreakupService) {}

  @Post()
  async create(@Body() dto: CreatePayrollRunItemBreakupDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating breakup');
    }
  }

  @Get()
  async findAll(@Query() query: QueryPayrollRunItemBreakupDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching breakups');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching breakup');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayrollRunItemBreakupDto,
  ) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating breakup');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting breakup');
    }
  }
}

