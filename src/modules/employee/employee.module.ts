import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee/entities/employee.entity';
import { EmployeeService } from './employee/employee.service';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeAddress } from './employee-address/entities/employee-address.entity';
import { EmployeeBankAccount } from './employee-bank-account/entities/employee-bank-account.entity';
import { EmployeeDocument } from './employee-document/entities/employee-document.entity';
import { EmployeeStatutoryId } from './employee-statutory-id/entities/employee-statutory-id.entity';
import { EmployeeAddressController } from './employee-address/employee-address.controller';
import { EmployeeDocumentController } from './employee-document/employee-document.controller';
import { EmployeeBankAccountController } from './employee-bank-account/employee-bank-account.controller';
import { EmployeeStatutoryIdController } from './employee-statutory-id/employee-statutory-id.controller';
import { EmployeeAddressService } from './employee-address/employee-address.service';
import { EmployeeDocumentService } from './employee-document/employee-document.service';
import { EmployeeBankAccountService } from './employee-bank-account/employee-bank-account.service';
import { EmployeeStatutoryIdService } from './employee-statutory-id/employee-statutory-id.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeeAddress,
      EmployeeBankAccount,
      EmployeeDocument,
      EmployeeStatutoryId
    ])
  ],
  controllers: [
    EmployeeController,
    EmployeeAddressController,
    EmployeeDocumentController,
    EmployeeBankAccountController,
    EmployeeStatutoryIdController
  ],
  providers: [
    EmployeeService,
    EmployeeAddressService,
    EmployeeDocumentService,
    EmployeeBankAccountService,
    EmployeeStatutoryIdService
  ],
  exports: [TypeOrmModule],
})
export class EmployeeModule { }

