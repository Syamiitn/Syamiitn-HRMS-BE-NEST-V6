import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { StorageService } from './storage/storage.service';
import { AuditLog } from '../apex/audit-log/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentVersion, AuditLog])],
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService],
  exports: [TypeOrmModule],
})
export class DocumentsModule {}

