import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollRunItemDto } from './create-payroll-run-item.dto';

export class UpdatePayrollRunItemDto extends PartialType(CreatePayrollRunItemDto) {}

