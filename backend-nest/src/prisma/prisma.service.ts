import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ensureDatabaseSchema } from './schema-sync';

dotenv.config({ path: '.env' });

const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = process.env.DB_PORT ?? '3306';
const dbUser = process.env.DB_USER ?? 'root';
const dbPass = process.env.DB_PASSWORD ?? '';
const dbName = process.env.DB_NAME ?? 'mockhub';
const dbConfig = {
  host: dbHost,
  port: Number(dbPort),
  user: dbUser,
  password: dbPass,
  database: dbName,
};

const databaseUrl =
  process.env.DATABASE_URL ??
  `mysql://${dbUser}:${encodeURIComponent(dbPass)}@${dbHost}:${dbPort}/${dbName}`;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaMariaDb(databaseUrl);
    super({ adapter });
  }

  async onModuleInit() {
    await ensureDatabaseSchema(dbConfig);
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

