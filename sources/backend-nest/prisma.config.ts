import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config({ path: '.env' });

const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = process.env.DB_PORT ?? '3306';
const dbUser = process.env.DB_USER ?? 'root';
const dbPass = process.env.DB_PASSWORD ?? '';
const dbName = process.env.DB_NAME ?? 'mockhub';

const databaseUrl =
  process.env.DATABASE_URL ??
  `mysql://${dbUser}:${encodeURIComponent(dbPass)}@${dbHost}:${dbPort}/${dbName}`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});
