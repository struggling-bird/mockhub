import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface RequestLogCreateInput {
  projectId: string;
  apiId?: string | null;
  method: string;
  path: string;
  mode?: string | null;
  statusCode: number;
  durationMs: number;
  errorMessage?: string | null;
}

export interface RequestLogRecentItem {
  id: string;
  method: string;
  path: string;
  mode: string | null;
  statusCode: number;
  durationMs: number;
  createdAt: Date;
  projectName: string | null;
  apiName: string | null;
}

@Injectable()
export class RequestLogsService {
  private readonly logger = new Logger(RequestLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  write(input: RequestLogCreateInput) {
    void (async () => {
      try {
        await this.prisma.$executeRaw`
          INSERT INTO request_logs (
            id,
            project_id,
            api_id,
            method,
            path,
            mode,
            status_code,
            duration_ms,
            error_message
          )
          VALUES (
            ${this.createId()},
            ${input.projectId},
            ${input.apiId || null},
            ${input.method},
            ${input.path},
            ${input.mode || null},
            ${input.statusCode},
            ${Math.max(0, Math.round(input.durationMs))},
            ${input.errorMessage || null}
          )
        `;
      } catch (error) {
        this.logger.warn(
          `request log write failed project=${input.projectId} path=${input.path}: ${
            error instanceof Error ? error.message : 'unknown error'
          }`,
        );
      }
    })();
  }

  async countSince(projectIds: string[], since: Date) {
    if (projectIds.length === 0) return 0;
    const rows = await this.prisma.$queryRaw<{ count: bigint | number }[]>`
      SELECT COUNT(*) AS count
      FROM request_logs
      WHERE project_id IN (${Prisma.join(projectIds)})
        AND created_at >= ${since}
    `;
    return Number(rows[0]?.count ?? 0);
  }

  async recent(projectIds: string[], take = 5): Promise<RequestLogRecentItem[]> {
    if (projectIds.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        rl.id,
        rl.method,
        rl.path,
        rl.mode,
        rl.status_code AS statusCode,
        rl.duration_ms AS durationMs,
        rl.created_at AS createdAt,
        p.name AS projectName,
        pa.name AS apiName
      FROM request_logs rl
      INNER JOIN projects p ON p.id = rl.project_id
      LEFT JOIN project_apis pa ON pa.id = rl.api_id
      WHERE rl.project_id IN (${Prisma.join(projectIds)})
      ORDER BY rl.created_at DESC
      LIMIT ${take}
    `;

    return rows.map((row) => ({
      id: String(row.id),
      method: String(row.method),
      path: String(row.path),
      mode: row.mode === null || row.mode === undefined ? null : String(row.mode),
      statusCode: Number(row.statusCode),
      durationMs: Number(row.durationMs),
      createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
      projectName: row.projectName ? String(row.projectName) : null,
      apiName: row.apiName ? String(row.apiName) : null,
    }));
  }

  private createId() {
    return `rl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
