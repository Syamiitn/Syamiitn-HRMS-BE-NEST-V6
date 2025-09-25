import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExitTaskController } from './exit-task/exit-task.controller';
import { ExitTaskService } from './exit-task/exit-task.service';
import { ExitTask } from './exit-task/entities/exit-task.entity';
import { ExitProcess } from './exit-process/entities/exit-process.entity';
import { ExitChecklistMaster } from './exit-checklist-master/entities/exit-checklist-master.entity';
import { FinalSettlement } from './final-settlement/entities/final-settlement.entity';
import { ExitChecklistMasterController } from './exit-checklist-master/exit-checklist-master.controller';
import { ExitProcessController } from './exit-process/exit-process.controller';
import { FinalSettlementController } from './final-settlement/final-settlement.controller';
import { ExitProcessService } from './exit-process/exit-process.service';
import { ExitChecklistMasterService } from './exit-checklist-master/exit-checklist-master.service';
import { FinalSettlementService } from './final-settlement/final-settlement.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ExitTask,
            ExitProcess,
            ExitChecklistMaster,
            FinalSettlement
        ])
    ],
    controllers: [
        ExitTaskController,
        ExitProcessController,
        ExitChecklistMasterController,
        FinalSettlementController
    ],
    providers: [
        ExitTaskService,
        ExitProcessService,
        ExitChecklistMasterService,
        FinalSettlementService
    ],
    exports: [
        TypeOrmModule
    ],
})
export class ExitModule { }
