import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';
import { getLogoUploadDir } from './upload/upload-path';

dotenv.config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const instance = app.getHttpAdapter().getInstance();
  const logoDir = getLogoUploadDir();
  await mkdir(logoDir, { recursive: true }).catch(() => {});

  await instance.register(multipart);

  app.setGlobalPrefix('api');
  app.enableCors();

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
