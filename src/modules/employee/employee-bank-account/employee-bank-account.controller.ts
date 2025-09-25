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
import { EmployeeBankAccountService } from './employee-bank-account.service';
import { CreateEmployeeBankAccountDto } from './dto/create-employee-bank-account.dto';
import { UpdateEmployeeBankAccountDto } from './dto/update-employee-bank-account.dto';
import { QueryEmployeeBankAccountDto } from './dto/query-employee-bank-account.dto';

@Controller('employee-bank-accounts')
@UsePipes(
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
)
export class EmployeeBankAccountController {
  constructor(private readonly service: EmployeeBankAccountService) {}

  @Post()
  async create(@Body() dto: CreateEmployeeBankAccountDto) {
    try {
      return await this.service.create(dto);
    } catch (err) {
      // Let known HttpExceptions bubble up; wrap unknowns
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error creating bank account');
    }
  }

  @Get()
  async findAll(@Query() query: QueryEmployeeBankAccountDto) {
    try {
      return await this.service.findAll(query);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching bank accounts');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.service.findOne(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching bank account');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeBankAccountDto,
  ) {
    try {
      return await this.service.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error updating bank account');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.service.remove(id);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting bank account');
    }
  }
}

