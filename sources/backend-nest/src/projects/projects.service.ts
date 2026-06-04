import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  isManagedLogoUrl,
  resolveLogoPathFromUrl,
} from '../upload/upload-path';
import * as fs from 'fs/promises';
import { ok } from '../common/api-response';
import { ProjectAccessService } from './project-access.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  private async deleteLogoFile(logoUrl?: string | null) {
    if (!logoUrl || !isManagedLogoUrl(logoUrl)) return;

    try {
      await fs.unlink(resolveLogoPathFromUrl(logoUrl));
    } catch (err: any) {
      // 文件不存在等情况忽略即可，避免影响主流程
      if (err && err.code !== 'ENOENT') {
        // 其他错误仅记录，不抛出
        // 可以根据需要接入日志系统
      }
    }
  }

  private toSummary(project: any, role?: string) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      logoUrl: project.logoUrl ?? null,
      proxyUrl: project.proxyUrl ?? null,
      mockKey: project.mockKey,
      defaultMockMode: project.defaultMockMode ?? 'static',
      autoCapture: project.autoCapture ?? false,
      cookieRewriteMode: project.cookieRewriteMode ?? 'off',
      cookieRewriteDomain: project.cookieRewriteDomain ?? null,
      role,
    };
  }

  async listByOwner(ownerId: string) {
    const projects = await this.prisma.$queryRaw<any[]>`
      SELECT
        p.id,
        p.name,
        p.description,
        p.logo_url AS logoUrl,
        p.proxy_url AS proxyUrl,
        p.mock_key AS mockKey,
        p.default_mock_mode AS defaultMockMode,
        p.auto_capture AS autoCapture,
        p.cookie_rewrite_mode AS cookieRewriteMode,
        p.cookie_rewrite_domain AS cookieRewriteDomain,
        p.owner_id AS ownerId,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        CASE
          WHEN p.owner_id = ${ownerId} THEN 'Owner'
          ELSE pm.role
        END AS role
      FROM projects p
      LEFT JOIN project_members pm
        ON pm.project_id = p.id
       AND pm.user_id = ${ownerId}
       AND pm.status = 'Active'
      WHERE ${this.projectAccess.visibleProjectFilter(ownerId)}
      ORDER BY p.created_at DESC
    `;

    return ok(
      projects.map((p) => this.toSummary(p, p.role)),
      '获取项目列表成功',
    );
  }

  async create(ownerId: string, dto: CreateProjectDto) {
    const mockKey = `mk_${Math.random().toString(36).slice(2, 10)}${Date.now()
      .toString(36)
      .slice(-4)}`;
    const defaultMockMode = dto.defaultMockMode ?? 'static';
    const autoCapture = dto.autoCapture ?? false;
    const cookieRewriteMode = dto.cookieRewriteMode ?? 'off';
    const cookieRewriteDomain = dto.cookieRewriteDomain ?? null;
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        ownerId,
        mockKey,
        // defaultMockMode 尚未在 Prisma Client 类型中声明，这里通过 any 绕过类型限制
        ...( { defaultMockMode } as any ),
        ...( { autoCapture } as any ),
        ...( { cookieRewriteMode } as any ),
        ...( { cookieRewriteDomain } as any ),
        ...(dto.proxyUrl ? ({ proxyUrl: dto.proxyUrl } as any) : {}),
      } as any,
    });

    return ok(this.toSummary(project, 'Owner'), '创建项目成功');
  }

  async getById(ownerId: string, id: string) {
    const access = await this.projectAccess.ensurePermission(ownerId, id, 'project.view');
    const project = await this.prisma.project.findFirst({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return ok(this.toSummary(project, access.role), '获取项目详情成功');
  }

  async update(ownerId: string, id: string, dto: UpdateProjectDto) {
    const access = await this.projectAccess.ensurePermission(ownerId, id, 'project.update');
    const project = await this.prisma.project.findFirst({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const nextLogoUrl =
      dto.logoUrl !== undefined ? dto.logoUrl : project.logoUrl ?? null;

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name ?? project.name,
        description:
          dto.description !== undefined ? dto.description : project.description,
        logoUrl: nextLogoUrl,
        ...(dto.defaultMockMode !== undefined
          ? ({ defaultMockMode: dto.defaultMockMode } as any)
          : {}),
        ...(dto.proxyUrl !== undefined
          ? ({ proxyUrl: dto.proxyUrl || null } as any)
          : {}),
        ...(dto.autoCapture !== undefined
          ? ({ autoCapture: dto.autoCapture } as any)
          : {}),
        ...(dto.cookieRewriteMode !== undefined
          ? ({ cookieRewriteMode: dto.cookieRewriteMode } as any)
          : {}),
        ...(dto.cookieRewriteDomain !== undefined
          ? ({ cookieRewriteDomain: dto.cookieRewriteDomain } as any)
          : {}),
      } as any,
    });

    // 如果 logo 发生了变化，删除旧文件
    if (project.logoUrl && project.logoUrl !== nextLogoUrl) {
      await this.deleteLogoFile(project.logoUrl);
    }

    return ok(this.toSummary(updated, access.role), '更新项目成功');
  }

  async delete(ownerId: string, id: string) {
    await this.projectAccess.ensurePermission(ownerId, id, 'project.delete');
    const project = await this.prisma.project.findFirst({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.delete({ where: { id } });
    // 删除关联的 logo 文件（如果有）
    await this.deleteLogoFile(project.logoUrl);
    return ok({ success: true }, '删除项目成功');
  }
}
