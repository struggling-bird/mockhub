import { Injectable } from '@nestjs/common';
import { ok } from '../common/api-response';
import { PrismaService } from '../prisma/prisma.service';
import { RequestLogsService } from '../request-logs/request-logs.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestLogsService: RequestLogsService,
  ) {}

  async summary(ownerId: string) {
    const projects = await this.prisma.project.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        proxyUrl: true,
      },
    });
    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
      return ok(
        {
          stats: {
            totalApis: 0,
            activeProxies: 0,
            teamMembers: 1,
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
    const [totalApis, requestsPerHour, recentActivity] = await Promise.all([
      this.prisma.projectApi.count({
        where: { projectId: { in: projectIds } },
      }),
      this.requestLogsService.countSince(projectIds, oneHourAgo),
      this.requestLogsService.recent(projectIds, 5),
    ]);

    return ok(
      {
        stats: {
          totalApis,
          activeProxies: projects.filter((project) => Boolean(project.proxyUrl)).length,
          teamMembers: 1,
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
}
