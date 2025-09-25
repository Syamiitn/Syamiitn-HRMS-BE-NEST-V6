import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveTypeController } from './leave-type/leave-type.controller';
import { LeaveTypeService } from './leave-type/leave-type.service';
import { LeaveType } from './leave-type/entities/leave-type.entity';
import { LeaveRequest } from './leave-request/entities/leave-request.entity';
import { LeaveAllocation } from './leave-allocation/entities/leave-allocation.entity';
import { LeaveAssignment } from './leave-assignment/entities/leave-assignment.entity';
import { LeaveRequestController } from './leave-request/leave-request.controller';
import { LeaveAllocationController } from './leave-allocation/leave-allocation.controller';
import { LeaveAssignmentController } from './leave-assignment/leave-assignment.controller';
import { LeaveRequestService } from './leave-request/leave-request.service';
import { LeaveAllocationService } from './leave-allocation/leave-allocation.service';
import { LeaveAssignmentService } from './leave-assignment/leave-assignment.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            LeaveType,
            LeaveRequest,
            LeaveAllocation,
            LeaveAssignment
        ])
    ],
    controllers: [
        LeaveTypeController,
        LeaveRequestController,
        LeaveAllocationController,
        LeaveAssignmentController,
    ],
    providers: [
        LeaveTypeService,
        LeaveRequestService,
        LeaveAllocationService,
        LeaveAssignmentService,
    ],
    exports: [
        TypeOrmModule
    ],
})
export class LeaveModule { }
