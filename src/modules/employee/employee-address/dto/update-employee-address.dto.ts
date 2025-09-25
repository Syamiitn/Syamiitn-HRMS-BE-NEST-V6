import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeAddressDto } from './create-employee-address.dto';

export class UpdateEmployeeAddressDto extends PartialType(CreateEmployeeAddressDto) {}

