import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Template, TemplateCategory, TemplateFormat } from './entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { QueryTemplateDto } from './dto/query-template.dto';
import { ExportFormat } from './dto/render-template.dto';
import { AuditLog } from '../apex/audit-log/entities/audit-log.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template) private readonly repo: Repository<Template>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  private placeholderRegex = /\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g;

  parsePlaceholders(content: string): string[] {
    const found = new Set<string>();
    for (const m of content.matchAll(this.placeholderRegex) as any) {
      if (m[1]) found.add(m[1]);
    }
    return Array.from(found);
  }

  private requiredByCategory(cat: TemplateCategory): string[] {
    switch (cat) {
      case TemplateCategory.EMAIL:
        return ['recipient_name', 'app_name'];
      case TemplateCategory.OTP:
        return ['otp_code', 'otp_expiry_minutes'];
      case TemplateCategory.SMS:
        return ['app_name'];
      default:
        return [];
    }
  }

  private ensurePlaceholders(category: TemplateCategory, content: string, custom?: string[]) {
    const placeholders = this.parsePlaceholders(content);
    const required = [...this.requiredByCategory(category), ...(custom ?? [])];
    const missing = required.filter((r) => !placeholders.includes(r));
    if (missing.length) {
      throw new BadRequestException(`Missing required placeholders: ${missing.join(', ')}`);
    }
  }

  private async log(actorId: number | null | undefined, action: string, id: string, message?: string, metadata?: any) {
    try {
      const log = this.auditRepo.create({
        actorId: actorId ?? null,
        action,
        entityName: 'Template',
        entityId: id,
        message: message ?? null,
        metadata: metadata ?? null,
        isSuccess: true,
        isActive: true,
      } as any);
      await this.auditRepo.save(log);
    } catch {}
  }

  private ensureWriteAccess(actor: any, tpl?: Template) {
    const role: string | undefined = actor?.role;
    const userId: number | undefined = actor?.sub;
    const isAdmin = role === 'admin' || role === 'ADMIN' || role === 'Admin' || role === 'manager' || role === 'MANAGER';
    if (!isAdmin) {
      // allow owners to edit their templates
      if (!tpl || !tpl.ownerUserId || tpl.ownerUserId !== userId) throw new ForbiddenException('Insufficient permissions');
    }
  }

  async create(dto: CreateTemplateDto, actor?: any): Promise<Template> {
    this.ensurePlaceholders(dto.category, dto.content, dto.requiredPlaceholders);
    const entity = this.repo.create({ ...(dto as any), ownerUserId: dto.ownerUserId ?? actor?.sub ?? null } as any);
    const saved = (await this.repo.save(entity as any)) as Template;
    await this.log(actor?.sub, 'template.create', saved.id);
    return saved;
  }

  async findAll(query: QueryTemplateDto): Promise<Template[]> {
    const where: any[] = [];
    const base: any = {};
    if (query.category) base.category = query.category;
    if (query.format) base.format = query.format;
    if (typeof query.isActive === 'boolean') base.isActive = query.isActive;
    if (query.ownerUserId) base.ownerUserId = query.ownerUserId;
    if (query.search) {
      const term = `%${query.search}%`;
      where.push({ name: Like(term) });
      where.push({ code: Like(term) });
      where.push({ content: Like(term) });
    }
    const orderBy = query.sortBy ?? 'createdAt';
    const orderDir: 'ASC' | 'DESC' = (query.sortOrder ?? 'DESC') as any;
    const options: any = {
      where: where.length ? where.map((w) => ({ ...w, ...base })) : base,
      order: { [orderBy]: orderDir },
    };
    if (query.page && query.limit) {
      options.skip = (query.page - 1) * query.limit;
      options.take = query.limit;
    }
    return this.repo.find(options);
  }

  async findOne(id: string): Promise<Template> {
    const tpl = await this.repo.findOne({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    return tpl;
  }

  async update(id: string, dto: UpdateTemplateDto, actor?: any): Promise<Template> {
    const existing = await this.findOne(id);
    this.ensureWriteAccess(actor, existing);
    if (dto.content || dto.category || dto.requiredPlaceholders) {
      this.ensurePlaceholders(dto.category ?? existing.category, dto.content ?? existing.content, dto.requiredPlaceholders ?? existing.requiredPlaceholders ?? undefined);
    }
    const entity = await this.repo.preload({ id, ...(dto as any) } as any);
    if (!entity) throw new NotFoundException('Template not found');
    const saved = await this.repo.save(entity);
    await this.log(actor?.sub, 'template.update', id);
    return saved;
  }

  async remove(id: string, actor?: any): Promise<void> {
    const existing = await this.findOne(id);
    this.ensureWriteAccess(actor, existing);
    await this.repo.delete(id);
    await this.log(actor?.sub, 'template.delete', id);
  }

  private getDeep(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
  }

  renderContent(tpl: Template, data: Record<string, any>, failOnMissing?: boolean): string {
    const missing: string[] = [];
    const rendered = tpl.content.replace(this.placeholderRegex, (_m, p1) => {
      const v = this.getDeep(data, String(p1));
      if (v === undefined || v === null) {
        if (failOnMissing) missing.push(String(p1));
        return '';
      }
      return String(v);
    });
    if (missing.length) throw new BadRequestException(`Missing data for placeholders: ${missing.join(', ')}`);
    return rendered;
  }

  async export(tpl: Template, content: string, target?: ExportFormat): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const baseName = `${tpl.code}-${Date.now()}`;
    const desired = target ?? (tpl.format === TemplateFormat.HTML ? ExportFormat.HTML : ExportFormat.TEXT);
    if (desired === ExportFormat.TEXT) {
      return { buffer: Buffer.from(content, 'utf-8'), contentType: 'text/plain; charset=utf-8', fileName: `${baseName}.txt` };
    }
    if (desired === ExportFormat.HTML) {
      const html = tpl.format === TemplateFormat.HTML ? content : `<pre>${content.replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'} as any)[c])}</pre>`;
      return { buffer: Buffer.from(html, 'utf-8'), contentType: 'text/html; charset=utf-8', fileName: `${baseName}.html` };
    }
    if (desired === ExportFormat.PDF) {
      try {
        // Try pdfkit if available
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];
        doc.on('data', (c: Buffer) => chunks.push(c));
        doc.on('error', () => {});
        doc.text(content, { width: 500 });
        doc.end();
        await new Promise((resolve) => doc.on('end', resolve));
        const buf = Buffer.concat(chunks);
        return { buffer: buf, contentType: 'application/pdf', fileName: `${baseName}.pdf` };
      } catch (e) {
        // Fallback
        return { buffer: Buffer.from(content, 'utf-8'), contentType: 'text/plain; charset=utf-8', fileName: `${baseName}.txt` };
      }
    }
    if (desired === ExportFormat.DOCX) {
      try {
        // Try docx library if available
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const docx = require('docx');
        const { Document: D, Packer, Paragraph, TextRun } = docx;
        const paragraphs = content.split(/\r?\n/).map((line: string) => new Paragraph({ children: [new TextRun(line)] }));
        const d = new D({ sections: [{ properties: {}, children: paragraphs }] });
        const buf = await Packer.toBuffer(d);
        return { buffer: buf, contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileName: `${baseName}.docx` };
      } catch (e) {
        return { buffer: Buffer.from(content, 'utf-8'), contentType: 'text/plain; charset=utf-8', fileName: `${baseName}.txt` };
      }
    }
    throw new BadRequestException('Unsupported export format');
  }
}
