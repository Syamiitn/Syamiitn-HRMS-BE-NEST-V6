import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface MediaSaveResult {
  storageKey: string;
  url?: string;
}

@Injectable()
export class MediaStorageService {
  private provider = (process.env.POST_MEDIA_PROVIDER as 'local' | 's3') || 'local';
  private localRoot = process.env.POST_MEDIA_LOCAL_ROOT || path.resolve(process.cwd(), 'uploads', 'posts');

  private sanitize(name: string) {
    return name.replace(/[^A-Za-z0-9._-]+/g, '_');
  }

  private async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  async save(buffer: Buffer, mimeType: string, originalName: string): Promise<MediaSaveResult> {
    if (this.provider === 's3') return this.saveS3(buffer, mimeType, originalName);
    const id = randomUUID();
    const dir = path.join(this.localRoot, id);
    await this.ensureDir(dir);
    const fileName = this.sanitize(originalName);
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buffer);
    const storageKey = path.relative(this.localRoot, filePath);
    return { storageKey };
  }

  async remove(storageKey: string) {
    if (this.provider === 's3' && storageKey.startsWith('s3://')) return this.removeS3(storageKey);
    const filePath = path.resolve(this.localRoot, storageKey);
    try { await fs.unlink(filePath); } catch {}
  }

  private async saveS3(buffer: Buffer, mimeType: string, originalName: string): Promise<MediaSaveResult> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const bucket = process.env.S3_BUCKET as string;
    const region = process.env.S3_REGION as string;
    const prefix = process.env.S3_PREFIX || 'posts/';
    if (!bucket || !region) {
      return this.save(buffer, mimeType, originalName);
    }
    const client = new S3Client({ region });
    const key = `${prefix}${randomUUID()}/${this.sanitize(originalName)}`;
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType }));
    return { storageKey: `s3://${bucket}/${key}`, url: `https://${bucket}.s3.${region}.amazonaws.com/${key}` };
  }

  private async removeS3(storageKey: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const m = storageKey.match(/^s3:\/\/([^/]+)\/(.+)$/);
    if (!m) return;
    const bucket = m[1];
    const key = m[2];
    const region = process.env.S3_REGION as string;
    const client = new S3Client({ region });
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}

