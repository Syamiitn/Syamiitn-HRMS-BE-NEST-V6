import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
// Use 'any' in decorated signatures to avoid isolatedModules metadata issues
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { RollbackDocumentDto } from './dto/rollback-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../apex/user/entities/user.entity';

const maxBytes = Number(process.env.DOCS_MAX_BYTES ?? 20 * 1024 * 1024);
const allowedMimes = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/json',
];

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: maxBytes },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) return cb(null, true);
        if (allowedMimes.includes(file.mimetype)) return cb(null, true);
        return cb(new BadRequestException('Unsupported file type') as any, false);
      },
    }),
  )
  async upload(
    @UploadedFile() file: any,
    @Body() dto: UploadDocumentDto,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('file is required');
    try {
      const result = await this.service.upload({
        buffer: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        title: dto.title,
        ownerUserId: dto.ownerUserId ?? (req as any).user?.sub,
        documentId: dto.documentId,
        actor: (req as any).user,
      });
      return { id: result.document.id, version: result.version.version };
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error uploading document');
    }
  }

  @Get(':id')
  async getMeta(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.service.getDocument(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching document');
    }
  }

  @Get(':id/versions')
  async versions(@Param('id') id: string, @Req() req: any) {
    try {
      return await this.service.listVersions(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error fetching versions');
    }
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Query('version') version: string, @Res() res: any, @Req() req: any) {
    try {
      const v = version ? parseInt(version, 10) : undefined;
      const { stream, mimeType, fileName } = await this.service.stream(id, v, (req as any).user);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      stream.pipe(res);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error downloading document');
    }
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string, @Query('version') version: string, @Res() res: any, @Req() req: any) {
    try {
      const v = version ? parseInt(version, 10) : undefined;
      const { stream, mimeType, fileName } = await this.service.stream(id, v, (req as any).user);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
      stream.pipe(res);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error previewing document');
    }
  }

  @Post(':id/rollback')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async rollback(@Param('id') id: string, @Body() dto: RollbackDocumentDto, @Req() req: any) {
    try {
      return await this.service.rollback(id, dto.version, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error rolling back document');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async remove(@Param('id') id: string, @Req() req: any) {
    try {
      await this.service.remove(id, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting document');
    }
  }

  @Delete(':id/versions/:version')
  @HttpCode(204)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async removeVersion(
    @Param('id') id: string,
    @Param('version', ParseIntPipe) version: number,
    @Req() req: any,
  ) {
    try {
      await this.service.removeVersion(id, version, (req as any).user);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException('Unexpected error deleting version');
    }
  }
}
