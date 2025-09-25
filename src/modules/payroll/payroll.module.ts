import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollRun } from './payroll-run/entities/payroll-run.entity';
import { PayrollRunController } from './payroll-run/payroll-run.controller';
import { PayrollRunService } from './payroll-run/payroll-run.service';
import { PayrollRunItem } from './payroll-run-item/entities/payroll-run-item.entity';
import { PayrollRunItemBreakup } from './payroll-run-item-breakup/entities/payroll-run-item-breakup.entity';
import { SalaryComponent } from './salary-component/entities/salary-component.entity';
import { PayrollRunItemController } from './payroll-run-item/payroll-run-item.controller';
import { PayrollRunItemBreakupController } from './payroll-run-item-breakup/payroll-run-item-breakup.controller';
import { SalaryComponentController } from './salary-component/salary-component.controller';
import { PayrollRunItemService } from './payroll-run-item/payroll-run-item.service';
import { PayrollRunItemBreakupService } from './payroll-run-item-breakup/payroll-run-item-breakup.service';
import { SalaryComponentService } from './salary-component/salary-component.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PayrollRun,
            PayrollRunItem,
            PayrollRunItemBreakup,
            SalaryComponent
        ])
    ],
    controllers: [
        PayrollRunController,
        PayrollRunItemController,
        PayrollRunItemBreakupController,
        SalaryComponentController
    ],
    providers: [
        PayrollRunService,
        PayrollRunItemService,
        PayrollRunItemBreakupService,
        SalaryComponentService
    ],
    exports: [
        TypeOrmModule
    ],
})
export class PayrollModule { }
