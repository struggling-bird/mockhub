import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { RequestMethod } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';
import { getLogoUploadDir } from './upload/upload-path';

dotenv.config({ path: '.env' });

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 20 * 1024 * 1024,
    }),
  );

  const instance = app.getHttpAdapter().getInstance();
  const logoDir = getLogoUploadDir();
  await mkdir(logoDir, { recursive: true }).catch(() => {});

  await instance.register(multipart);

  instance.addHook('onRequest', async (req: any) => {
    const url = req.raw?.url || req.url || '';
    if (url === '/gateway' || url.startsWith('/gateway/')) {
      logger.log(
        `[GatewayIngress] ${req.method} ${url} host=${req.headers?.host || '-'} mockKey=${
          req.headers?.['x-mock-key'] ? 'present' : 'missing'
        }`,
      );
    }
  });

  // 网关入口需要是 /gateway/*（不走 /api 前缀），其余业务接口统一使用 /api
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'gateway', method: RequestMethod.ALL },
      { path: 'gateway{/*path}', method: RequestMethod.ALL },
    ],
  });
  app.enableCors();

  // 仅对 /gateway 路由启用 Buffer body parser，以便实现 100% 原始请求体透传
  await instance.register(
    async (fastify: any) => {
      fastify.addContentTypeParser(
        '*',
        { parseAs: 'buffer' },
        (_req: any, body: Buffer, done: any) => {
          done(null, body);
        },
      );
    },
    { prefix: '/gateway' },
  );

  const config = new DocumentBuilder()
    .setTitle('MockHub API')
    .setDescription('MockHub Node backend (NestJS + Fastify + Prisma)')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT || 4000);
  const configuredHost = process.env.HOST || '0.0.0.0';
  // Fastify 在部分 Node/系统组合下会因 0.0.0.0 的地址枚举崩溃，这里做本地开发兼容
  const listenHost = configuredHost === '0.0.0.0' ? '127.0.0.1' : configuredHost;
  await app.listen(port, listenHost);

  const url =
    process.env.NODE_ENV === 'production'
      ? `https://${configuredHost}:${port}/docs`
      : `http://${listenHost}:${port}/docs`;
  // 启动完成后在控制台打印接口文档地址，便于本地开发调试
  // eslint-disable-next-line no-console
  console.log(`🚀 API 文档已就绪: ${url}`);
}

bootstrap();
