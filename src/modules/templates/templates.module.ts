import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template } from './entities/template.entity';
import { AuditLog } from '../apex/audit-log/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template, AuditLog])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TypeOrmModule],
})
export class TemplatesModule {}

