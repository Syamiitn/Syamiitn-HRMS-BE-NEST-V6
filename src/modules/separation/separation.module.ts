import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Separation } from './separation/entities/separation.entity';
import { SeparationTask } from './separation-task/entities/separation-task.entity';
import { SeparationTaskController } from './separation-task/separation-task.controller';
import { SeparationTaskService } from './separation-task/separation-task.service';
import { SeparationReason } from './separation-reason/entities/separation-reason.entity';
import { SeparationReasonController } from './separation-reason/separation-reason.controller';
import { SeparationReasonService } from './separation-reason/separation-reason.service';
import { SeparationCategory } from './separation-category/entities/separation-category.entity';
import { SeparationCategoryController } from './separation-category/separation-category.controller';
import { SeparationCategoryService } from './separation-category/separation-category.service';
import { SeparationController } from './separation/separation.controller';
import { SeparationService } from './separation/separation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Separation, SeparationTask, SeparationReason, SeparationCategory])],
  controllers: [SeparationController, SeparationTaskController, SeparationReasonController, SeparationCategoryController],
  providers: [SeparationService, SeparationTaskService, SeparationReasonService, SeparationCategoryService],
  exports: [TypeOrmModule],
})
export class SeparationModule {}
