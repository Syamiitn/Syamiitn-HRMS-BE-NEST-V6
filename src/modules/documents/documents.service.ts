import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, StorageProvider } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { StorageService } from './storage/storage.service';
import { AuditLog } from '../apex/audit-log/entities/audit-log.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document) private readonly docRepo: Repository<Document>,
    @InjectRepository(DocumentVersion) private readonly verRepo: Repository<DocumentVersion>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    private readonly storage: StorageService,
  ) {}

  private allowedMime(mime: string): boolean {
    const allowed = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/json',
    ];
    if (mime.startsWith('image/')) return true;
    return allowed.includes(mime);
  }

  private async log(actorId: number | null | undefined, action: string, entityId: string, message?: string, metadata?: any, isSuccess = true) {
    try {
      const log = this.auditRepo.create({
        actorId: actorId ?? null,
        action,
        entityName: 'Document',
        entityId,
        message: message ?? null,
        metadata: metadata ?? null,
        isSuccess,
        isActive: true,
      } as any);
      await this.auditRepo.save(log);
    } catch {}
  }

  private ensureAccess(user: any, doc: Document) {
    // Admins or owners may manage; others read-only
    const role: string | undefined = user?.role;
    const userId: number | undefined = user?.sub;
    const isOwner = doc.ownerUserId && userId && doc.ownerUserId === userId;
    const isAdmin = role === 'admin' || role === 'ADMIN' || role === 'Admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }
  }

  async upload(opts: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    title?: string;
    ownerUserId?: number;
    documentId?: string;
    actor?: any;
  }): Promise<{ document: Document; version: DocumentVersion }> {
    const size = opts.buffer?.length ?? 0;
    const max = Number(process.env.DOCS_MAX_BYTES ?? 20 * 1024 * 1024); // 20MB default
    if (size <= 0 || size > max) throw new BadRequestException('File size invalid or exceeds limit');
    if (!this.allowedMime(opts.mimeType)) throw new BadRequestException('Unsupported file type');

    const saved = await this.storage.save(opts.buffer, opts.mimeType, opts.originalName);

    if (opts.documentId) {
      const doc = await this.docRepo.findOne({ where: { id: opts.documentId } });
      if (!doc) throw new NotFoundException('Document not found');
      this.ensureAccess(opts.actor, doc);
      const nextVer = (await this.verRepo.count({ where: { documentId: doc.id } })) + 1;
      const ver = this.verRepo.create({
        documentId: doc.id,
        version: nextVer,
        title: opts.title ?? doc.title,
        mimeType: opts.mimeType,
        size: String(size),
        storageKey: saved.storageKey,
        checksum: saved.checksum,
        createdByUserId: opts.ownerUserId ?? opts.actor?.sub ?? null,
      } as any);
      const savedVer = (await this.verRepo.save(ver as any)) as DocumentVersion;
      doc.mimeType = opts.mimeType;
      doc.size = String(size);
      doc.title = opts.title ?? doc.title;
      doc.currentVersion = nextVer;
      await this.docRepo.save(doc);
      await this.log(opts.actor?.sub, 'document.upload_version', doc.id, `Uploaded v${nextVer}`, { mimeType: opts.mimeType, size });
      return { document: doc, version: savedVer };
    }

    // New document
    const title = opts.title ?? opts.originalName;
    const doc = this.docRepo.create({
      title,
      mimeType: opts.mimeType,
      size: String(size),
      ownerUserId: opts.ownerUserId ?? opts.actor?.sub ?? null,
      storageProvider: (process.env.STORAGE_PROVIDER as StorageProvider) || StorageProvider.LOCAL,
      currentVersion: 1,
      isActive: true,
    } as any);
    const savedDoc = await this.docRepo.save(doc as any);
    const ver = this.verRepo.create({
      documentId: savedDoc.id,
      version: 1,
      title,
      mimeType: opts.mimeType,
      size: String(size),
      storageKey: saved.storageKey,
      checksum: saved.checksum,
      createdByUserId: opts.ownerUserId ?? opts.actor?.sub ?? null,
    } as any);
    const savedVer = await this.verRepo.save(ver as any);
    await this.log(opts.actor?.sub, 'document.upload', savedDoc.id, 'Uploaded v1', { mimeType: opts.mimeType, size });
    return { document: savedDoc, version: savedVer };
  }

  async getDocument(id: string, actor?: any): Promise<Document> {
    const doc = await this.docRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    if (actor) this.ensureAccess(actor, doc);
    return doc;
  }

  async listVersions(id: string, actor?: any): Promise<DocumentVersion[]> {
    await this.getDocument(id, actor);
    return this.verRepo.find({ where: { documentId: id }, order: { version: 'ASC' } });
  }

  async stream(id: string, version?: number, actor?: any): Promise<{ stream: NodeJS.ReadableStream; mimeType: string; fileName: string }> {
    const doc = await this.getDocument(id, actor);
    const ver = version
      ? await this.verRepo.findOne({ where: { documentId: id, version } })
      : await this.verRepo.findOne({ where: { documentId: id, version: doc.currentVersion } });
    if (!ver) throw new NotFoundException('Document version not found');
    try {
      const stream = await this.storage.stream(ver.storageKey);
      return { stream, mimeType: ver.mimeType, fileName: ver.title };
    } catch (e) {
      throw new InternalServerErrorException('Failed to read document');
    }
  }

  async remove(id: string, actor?: any): Promise<void> {
    const doc = await this.getDocument(id);
    this.ensureAccess(actor, doc);
    const versions = await this.verRepo.find({ where: { documentId: id } });
    for (const v of versions) {
      try { await this.storage.remove(v.storageKey); } catch {}
    }
    await this.docRepo.delete(id);
    await this.log(actor?.sub, 'document.delete', id, 'Deleted document');
  }

  async removeVersion(id: string, version: number, actor?: any): Promise<void> {
    const doc = await this.getDocument(id);
    this.ensureAccess(actor, doc);
    const ver = await this.verRepo.findOne({ where: { documentId: id, version } });
    if (!ver) throw new NotFoundException('Document version not found');
    await this.verRepo.delete({ documentId: id, version });
    try { await this.storage.remove(ver.storageKey); } catch {}
    if (doc.currentVersion === version) {
      // move back to latest existing
      const remain = await this.verRepo.find({ where: { documentId: id }, order: { version: 'DESC' } });
      doc.currentVersion = remain[0]?.version ?? 0;
      await this.docRepo.save(doc);
    }
    await this.log(actor?.sub, 'document.delete_version', id, `Deleted v${version}`);
  }

  async rollback(id: string, targetVersion: number, actor?: any): Promise<Document> {
    const doc = await this.getDocument(id);
    this.ensureAccess(actor, doc);
    const ver = await this.verRepo.findOne({ where: { documentId: id, version: targetVersion } });
    if (!ver) throw new NotFoundException('Target version not found');
    doc.currentVersion = targetVersion;
    doc.mimeType = ver.mimeType;
    doc.size = ver.size;
    doc.title = ver.title;
    await this.docRepo.save(doc);
    await this.log(actor?.sub, 'document.rollback', id, `Rolled back to v${targetVersion}`);
    return doc;
  }
}
