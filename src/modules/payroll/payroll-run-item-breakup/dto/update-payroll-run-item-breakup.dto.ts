import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollRunItemBreakupDto } from './create-payroll-run-item-breakup.dto';

export class UpdatePayrollRunItemBreakupDto extends PartialType(
  CreatePayrollRunItemBreakupDto,
) {}

