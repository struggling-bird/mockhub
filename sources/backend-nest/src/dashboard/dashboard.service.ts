import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ok } from '../common/api-response';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../projects/project-access.service';
import { RequestLogsService } from '../request-logs/request-logs.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccess: ProjectAccessService,
    private readonly requestLogsService: RequestLogsService,
  ) {}

  async summary(ownerId: string) {
    const projects = await this.prisma.$queryRaw<
      { id: string; name: string; proxyUrl: string | null }[]
    >`
      SELECT
        p.id,
        p.name,
        p.proxy_url AS proxyUrl
      FROM projects p
      WHERE ${this.projectAccess.visibleProjectFilter(ownerId)}
    `;
    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
      return ok(
        {
          stats: {
            totalApis: 0,
            activeProxies: 0,
            teamMembers: 0,
            requestsPerHour: 0,
          },
          recentActivity: [],
          systemStatus: {
            proxyEngine: 'operational',
            mockStorage: 'operational',
            authService: 'operational',
          },
        },
        '获取 Dashboard 数据成功',
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [totalApis, requestsPerHour, recentActivity, teamMembers] = await Promise.all([
      this.prisma.projectApi.count({
        where: { projectId: { in: projectIds } },
      }),
      this.requestLogsService.countSince(projectIds, oneHourAgo),
      this.requestLogsService.recent(projectIds, 5),
      this.countTeamMembers(projectIds),
    ]);

    return ok(
      {
        stats: {
          totalApis,
          activeProxies: projects.filter((project) => Boolean(project.proxyUrl)).length,
          teamMembers,
          requestsPerHour,
        },
        recentActivity: recentActivity.map((item: any) => ({
          id: item.id,
          title: `${item.method} ${item.path}`,
          subtitle: item.apiName || item.projectName || 'Gateway request',
          mode: item.mode || 'unknown',
          statusCode: item.statusCode,
          durationMs: item.durationMs,
          createdAt: item.createdAt.toISOString(),
        })),
        systemStatus: {
          proxyEngine: 'operational',
          mockStorage: 'operational',
          authService: 'operational',
        },
      },
      '获取 Dashboard 数据成功',
    );
  }

  private async countTeamMembers(projectIds: string[]) {
    if (projectIds.length === 0) return 0;
    const rows = await this.prisma.$queryRaw<{ count: bigint | number }[]>`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM (
        SELECT owner_id AS user_id
        FROM projects
        WHERE id IN (${Prisma.join(projectIds)})
        UNION
        SELECT user_id
        FROM project_members
        WHERE project_id IN (${Prisma.join(projectIds)})
          AND status = 'Active'
      ) t
    `;
    return Number(rows[0]?.count ?? 0);
  }
}
