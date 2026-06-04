import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { generateId } from '../auth/auth.util';
import { ok } from '../common/api-response';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectAccessService } from '../projects/project-access.service';
import { CreateProxyGroupDto } from './dto/create-proxy-group.dto';
import { UpdateProxyGroupDto } from './dto/update-proxy-group.dto';

export type ProxyGroupMode = 'Mock' | 'Proxy' | 'Hybrid';

export interface ProxyGroupRecord {
  id: string;
  projectId: string;
  name: string;
  regex: string;
  mode: ProxyGroupMode;
  targetUrl: string | null;
  priority: number;
  enabled: boolean;
  autoCapture: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProxyGroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  async list(userId: string, projectId: string) {
    await this.projectAccess.ensurePermission(userId, projectId, 'api.view');
    return ok(await this.findByProject(projectId, false), '获取代理分组成功');
  }

  async create(userId: string, projectId: string, dto: CreateProxyGroupDto) {
    await this.projectAccess.ensurePermission(userId, projectId, 'api.update');
    const data = this.normalize(dto);
    const id = generateId('pg');
    await this.prisma.$executeRaw`
      INSERT INTO proxy_groups (id, project_id, name, regex, mode, target_url, priority, enabled, auto_capture)
      VALUES (${id}, ${projectId}, ${data.name}, ${data.regex}, ${data.mode}, ${data.targetUrl}, ${data.priority}, ${data.enabled ? 1 : 0}, ${data.autoCapture ? 1 : 0})
    `;
    return ok(await this.findByProject(projectId, false), '创建代理分组成功');
  }

  async update(userId: string, projectId: string, groupId: string, dto: UpdateProxyGroupDto) {
    await this.projectAccess.ensurePermission(userId, projectId, 'api.update');
    const existing = await this.findOne(projectId, groupId);
    if (!existing) {
      throw new NotFoundException('Proxy group not found');
    }
    const data = this.normalize({ ...existing, ...dto });
    await this.prisma.$executeRaw`
      UPDATE proxy_groups
      SET name = ${data.name},
          regex = ${data.regex},
          mode = ${data.mode},
          target_url = ${data.targetUrl},
          priority = ${data.priority},
          enabled = ${data.enabled ? 1 : 0},
          auto_capture = ${data.autoCapture ? 1 : 0}
      WHERE id = ${groupId}
        AND project_id = ${projectId}
    `;
    return ok(await this.findByProject(projectId, false), '更新代理分组成功');
  }

  async remove(userId: string, projectId: string, groupId: string) {
    await this.projectAccess.ensurePermission(userId, projectId, 'api.update');
    const existing = await this.findOne(projectId, groupId);
    if (!existing) {
      throw new NotFoundException('Proxy group not found');
    }
    await this.prisma.$executeRaw`
      DELETE FROM proxy_groups
      WHERE id = ${groupId}
        AND project_id = ${projectId}
    `;
    return ok(await this.findByProject(projectId, false), '删除代理分组成功');
  }

  async findByProject(projectId: string, enabledOnly = true) {
    const rows = enabledOnly
      ? await this.prisma.$queryRaw<any[]>`
          SELECT
            id,
            project_id AS projectId,
            name,
            regex,
            mode,
            target_url AS targetUrl,
            priority,
            enabled,
            auto_capture AS autoCapture,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM proxy_groups
          WHERE project_id = ${projectId}
            AND enabled = 1
          ORDER BY priority ASC, created_at ASC
        `
      : await this.prisma.$queryRaw<any[]>`
          SELECT
            id,
            project_id AS projectId,
            name,
            regex,
            mode,
            target_url AS targetUrl,
            priority,
            enabled,
            auto_capture AS autoCapture,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM proxy_groups
          WHERE project_id = ${projectId}
          ORDER BY priority ASC, created_at ASC
        `;
    return rows.map((row) => this.toDto(row));
  }

  private async findOne(projectId: string, groupId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        id,
        project_id AS projectId,
        name,
        regex,
        mode,
        target_url AS targetUrl,
        priority,
        enabled,
        auto_capture AS autoCapture,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM proxy_groups
      WHERE id = ${groupId}
        AND project_id = ${projectId}
      LIMIT 1
    `;
    return rows[0] ? this.toDto(rows[0]) : null;
  }

  private normalize(dto: CreateProxyGroupDto | UpdateProxyGroupDto | ProxyGroupRecord) {
    const name = String(dto.name || '').trim();
    const regex = String(dto.regex || '').trim();
    const mode = this.normalizeMode(dto.mode);
    const priority = Number.isFinite(Number(dto.priority)) ? Number(dto.priority) : 100;
    const targetUrl = dto.targetUrl ? String(dto.targetUrl).trim() : null;

    if (!name) throw new BadRequestException('name is required');
    if (!regex) throw new BadRequestException('regex is required');
    this.assertValidRegex(regex);
    if ((mode === 'Proxy' || mode === 'Hybrid') && targetUrl) {
      this.assertValidUrl(targetUrl);
    }

    return {
      name,
      regex,
      mode,
      targetUrl,
      priority,
      enabled: dto.enabled !== undefined ? Boolean(dto.enabled) : true,
      autoCapture: dto.autoCapture !== undefined ? Boolean(dto.autoCapture) : false,
    };
  }

  private normalizeMode(mode?: string): ProxyGroupMode {
    const value = String(mode || '').trim();
    if (value === 'Mock' || value === 'Proxy' || value === 'Hybrid') return value;
    throw new BadRequestException('mode must be Mock, Proxy, or Hybrid');
  }

  private assertValidRegex(regex: string) {
    try {
      new RegExp(regex);
    } catch {
      throw new BadRequestException('regex is invalid');
    }
  }

  private assertValidUrl(url: string) {
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('targetUrl is invalid');
    }
  }

  private toDto(row: any): ProxyGroupRecord {
    return {
      id: String(row.id),
      projectId: String(row.projectId),
      name: String(row.name),
      regex: String(row.regex),
      mode: this.normalizeMode(row.mode),
      targetUrl: row.targetUrl ? String(row.targetUrl) : null,
      priority: Number(row.priority || 0),
      enabled: row.enabled === true || row.enabled === 1,
      autoCapture: row.autoCapture === true || row.autoCapture === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}
