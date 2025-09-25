import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeBankAccountDto } from './create-employee-bank-account.dto';

export class UpdateEmployeeBankAccountDto extends PartialType(
  CreateEmployeeBankAccountDto,
) {}

