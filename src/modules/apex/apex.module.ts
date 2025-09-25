import { Module } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentController } from './department/department.controller';
import { DepartmentService } from './department/department.service';
import { Department } from './department/entities/department.entity';
import { Designation } from './designation/entities/designation.entity';
import { Holiday } from './holiday/entities/holiday.entity';
import { Shift } from './shift/entities/shift.entity';
import { User } from './user/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { Calendar } from './calendar/entities/calendar.entity';
import { AuditLog } from './audit-log/entities/audit-log.entity';
import { AuditLogController } from './audit-log/audit-log.controller';
import { CalendarController } from './calendar/calendar.controller';
import { DesignationController } from './designation/designation.controller';
import { HolidayController } from './holiday/holiday.controller';
import { ShiftController } from './shift/shift.controller';
import { UserController } from './user/user.controller';
import { RoleController } from './role/role.controller';
import { RoleService } from './role/role.service';
import { UserService } from './user/user.service';
import { ShiftService } from './shift/shift.service';
import { HolidayService } from './holiday/holiday.service';
import { DesignationService } from './designation/designation.service';
import { CalendarService } from './calendar/calendar.service';
import { AuditLogService } from './audit-log/audit-log.service';
import { Location } from './location/entities/location.entity';
import { LocationController } from './location/location.controller';
import { LocationService } from './location/location.service';
import { Organization } from './organization/entities/organization.entity';
import { OrganizationController } from './organization/organization.controller';
import { OrganizationService } from './organization/organization.service';
import { OrganizationSettings } from './organization-settings/entities/organization-settings.entity';
import { OrganizationSettingsController } from './organization-settings/organization-settings.controller';
import { OrganizationSettingsService } from './organization-settings/organization-settings.service';
import { Policy } from './policy/entities/policy.entity';
import { PolicyController } from './policy/policy.controller';
import { PolicyService } from './policy/policy.service';

@Module({
      imports: [
        TypeOrmModule.forFeature([
            Department,
            Designation,
            Holiday,
            Location,
            Shift,
            User,
            Role,
            Calendar,
            AuditLog,
            Organization,
            OrganizationSettings,
            Policy
        ])
    ],
      controllers: [
        DepartmentController,
        AuditLogController,
        CalendarController,
        DesignationController,
        HolidayController,
        ShiftController,
        UserController,
        RoleController,
        LocationController,
        OrganizationController,
        OrganizationSettingsController,
        PolicyController
    ],
      providers: [
        DepartmentService,
        AuditLogService,
        CalendarService,
        DesignationService,
        HolidayService,
        ShiftService,
        UserService,
        RoleService,
        LocationService,
        OrganizationService,
        OrganizationSettingsService,
        PolicyService,
        RolesGuard 
    ],  
      exports: [TypeOrmModule]
})
export class ApexModule {}
