import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import {
  getLogoUploadDir,
  isManagedLogoUrl,
  resolveLogoPathFromUrl,
} from './upload-path';
import sharp from 'sharp';
import { Public } from '../auth/public.decorator';
import { ok } from '../common/api-response';

function logUpload(): boolean {
  const v = process.env.LOG_UPLOAD;
  return v === undefined || v === '' || v === '1' || v === 'true';
}
function logPreview(): boolean {
  const v = process.env.LOG_PREVIEW;
  return v === undefined || v === '' || v === '1' || v === 'true';
}

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/avif',
    'image/heic',
    'image/heif',
  ]);

  private async deleteLogoFile(logoUrl?: string | null) {
    if (!logoUrl || !isManagedLogoUrl(logoUrl)) return;

    const fs = require('fs/promises') as typeof import('fs/promises');
    try {
      await fs.unlink(resolveLogoPathFromUrl(logoUrl));
    } catch (err: any) {
      if (err?.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  @Public()
  @Get('logos/:filename')
  @ApiOperation({
    summary: '预览已上传的项目 Logo',
    description:
      '根据文件名返回处理后的 WebP 图片流，主要用于在前端展示项目 Logo。',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回图片二进制流。',
    schema: {
      type: 'string',
      format: 'binary',
      description: 'WebP 图片二进制流',
    } as any,
  })
  async getLogo(
    @Param('filename') filename: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(getLogoUploadDir(), safeName);
    try {
      const st = await stat(filePath);
      if (logPreview()) {
        this.logger.log(
          `[预览] filename=${safeName} size=${st.size} contentType=image/webp`,
        );
      }
      const stream = createReadStream(filePath);
      res
        .header('Content-Type', 'image/webp')
        .header('Content-Length', String(st.size))
        .send(stream);
    } catch (err: any) {
      if (err?.code === 'ENOENT') {
        if (logPreview()) this.logger.warn(`[预览] 文件不存在 filename=${safeName}`);
        res.status(404).send({ message: 'Not found' });
        return;
      }
      if (logPreview()) this.logger.error(`[预览] 读取失败 filename=${safeName}`, err?.message);
      res.status(500).send({ message: 'Internal error' });
    }
  }

  @Post('logo')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '上传项目 Logo',
    description:
      '接收图片文件并统一压缩处理为 WebP 格式，返回可直接用于展示的访问 URL。',
  })
  @ApiResponse({
    status: 201,
    description: '上传成功，返回包含 url 字段的 JSON 对象。',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: '可直接在前端 img/src 中使用的访问地址',
          example: '/api/upload/logos/logo_1713778899_xxxxx.webp',
        },
      },
      required: ['url'],
    },
  })
  async uploadLogo(@Req() req: FastifyRequest & { userId?: string }) {
    const userId = req.userId as string | undefined;
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const file = await (req as any).file();
    if (!file) {
      if (logUpload()) this.logger.warn('[上传] 未收到文件');
      return { message: 'No file uploaded' };
    }
    const mimetype = file.mimetype || '';
    if (
      !mimetype.startsWith('image/') &&
      !this.allowedMimeTypes.has(mimetype)
    ) {
      if (logUpload()) this.logger.warn(`[上传] 类型不允许 mimetype=${mimetype} userId=${userId}`);
      throw new BadRequestException('Unsupported image type');
    }

    if (logUpload()) {
      this.logger.log(
        `[上传] 开始 userId=${userId} mimetype=${mimetype} fieldname=${file.fieldname}`,
      );
    }

    const path = require('path') as typeof import('path');
    const fs = require('fs/promises') as typeof import('fs/promises');

    const filename = `logo_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}.webp`;
    const logoDir = getLogoUploadDir();
    await fs.mkdir(logoDir, { recursive: true }).catch(() => {});

    const targetPath = path.join(logoDir, filename);

    const chunks: Buffer[] = [];
    for await (const chunk of file.file) {
      chunks.push(Buffer.from(chunk));
    }
    const original = Buffer.concat(chunks);
    const originalSize = original.length;
    if (logUpload()) this.logger.log(`[上传] 读取完成 原始大小=${originalSize} bytes`);

    try {
      const transformer = sharp(original, {
        failOn: 'none',
        animated: true,
        pages: 1,
      });

      const metadata = await transformer.metadata();
      if (!metadata.format) {
        if (logUpload()) this.logger.warn('[上传] 无法识别图片格式');
        throw new Error('Unknown image format');
      }

      const outputBuffer = await transformer
        .rotate()
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      await fs.writeFile(targetPath, outputBuffer);
      const url = `/api/upload/logos/${filename}`;
      if (logUpload()) {
        this.logger.log(
          `[上传] 成功 userId=${userId} url=${url} 压缩后=${outputBuffer.length} bytes`,
        );
      }
      return ok({ url }, '上传 Logo 成功');
    } catch (err: any) {
      if (logUpload()) {
        this.logger.error(
          `[上传] 失败 userId=${userId} error=${err?.message || err}`,
        );
      }
      throw new BadRequestException(
        'Unsupported or invalid image file, or compression failed',
      );
    }
  }

  @Post('logo/cleanup')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '清理项目 Logo 文件',
    description:
      '根据传入的 Logo URL 删除本地存储的文件，用于项目 Logo 变更或删除场景。',
  })
  @ApiResponse({
    status: 200,
    description: '清理成功，返回 { success: true }。',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: '是否清理成功',
          example: true,
        },
      },
      required: ['success'],
    },
  })
  async cleanupLogo(
    @Req() req: FastifyRequest & { userId?: string },
    @Body() body: { url?: string },
  ) {
    const userId = req.userId as string | undefined;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }
    const url = body?.url;
    if (logUpload()) this.logger.log(`[清理] userId=${userId} url=${url ?? '(empty)'}`);
    await this.deleteLogoFile(url);
    return ok({ success: true }, '清理 Logo 成功');
  }
}

