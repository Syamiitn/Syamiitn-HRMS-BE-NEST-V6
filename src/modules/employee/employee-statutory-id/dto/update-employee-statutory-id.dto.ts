import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeStatutoryIdDto } from './create-employee-statutory-id.dto';

export class UpdateEmployeeStatutoryIdDto extends PartialType(CreateEmployeeStatutoryIdDto) {}

