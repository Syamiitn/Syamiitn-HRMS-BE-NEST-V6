import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID, createHash } from 'crypto';
import { StorageProvider } from '../entities/document.entity';

export interface SaveResult {
  storageKey: string;
  url?: string;
  checksum?: string;
}

@Injectable()
export class StorageService {
  private provider: StorageProvider = (process.env.STORAGE_PROVIDER as StorageProvider) || StorageProvider.LOCAL;
  private localRoot = process.env.DOCS_LOCAL_ROOT || path.resolve(process.cwd(), 'uploads', 'documents');

  async save(buffer: Buffer, mimeType: string, originalName: string): Promise<SaveResult> {
    if (this.provider === StorageProvider.S3) {
      return this.saveToS3(buffer, mimeType, originalName);
    }
    return this.saveToLocal(buffer, originalName);
  }

  async stream(storageKey: string): Promise<NodeJS.ReadableStream> {
    if (this.provider === StorageProvider.S3 && storageKey.startsWith('s3://')) {
      return this.streamFromS3(storageKey);
    }
    const filePath = path.resolve(this.localRoot, storageKey);
    const stream = (await import('fs')).createReadStream(filePath);
    return stream;
  }

  async remove(storageKey: string): Promise<void> {
    if (this.provider === StorageProvider.S3 && storageKey.startsWith('s3://')) {
      await this.removeFromS3(storageKey);
      return;
    }
    const filePath = path.resolve(this.localRoot, storageKey);
    try {
      await fs.unlink(filePath);
    } catch (e) {
      // ignore if missing
    }
  }

  private async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  private sanitizeName(name: string): string {
    return name.replace(/[^A-Za-z0-9._-]+/g, '_');
  }

  private async saveToLocal(buffer: Buffer, originalName: string): Promise<SaveResult> {
    const id = randomUUID();
    const dir = path.join(this.localRoot, id);
    await this.ensureDir(dir);
    const fileName = this.sanitizeName(originalName);
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buffer);
    const checksum = createHash('sha256').update(buffer).digest('hex');
    // storageKey is relative to root to avoid leaking absolute path
    const storageKey = path.relative(this.localRoot, filePath);
    return { storageKey, checksum };
  }

  // Lazy S3 usage without top-level import (optional integration)
  private async saveToS3(buffer: Buffer, mimeType: string, originalName: string): Promise<SaveResult> {
    const bucket = process.env.S3_BUCKET as string;
    const region = process.env.S3_REGION as string;
    const keyPrefix = process.env.S3_PREFIX || 'documents/';
    if (!bucket || !region) {
      // fallback to local if misconfigured
      return this.saveToLocal(buffer, originalName);
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({ region });
    const key = `${keyPrefix}${randomUUID()}/${this.sanitizeName(originalName)}`;
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType }));
    const checksum = createHash('sha256').update(buffer).digest('hex');
    return { storageKey: `s3://${bucket}/${key}`, checksum };
  }

  private async streamFromS3(storageKey: string): Promise<NodeJS.ReadableStream> {
    const m = storageKey.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!m) throw new Error('Invalid s3 storageKey');
    const bucket = m[1];
    const key = m[2];
    const region = process.env.S3_REGION as string;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({ region });
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return res.Body as NodeJS.ReadableStream;
  }

  private async removeFromS3(storageKey: string): Promise<void> {
    const m = storageKey.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!m) return;
    const bucket = m[1];
    const key = m[2];
    const region = process.env.S3_REGION as string;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({ region });
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}

