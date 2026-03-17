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

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async listByOwner(ownerId: string) {
    const projects = await this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return ok(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.createdAt.toISOString(),
        logoUrl: p.logoUrl ?? null,
      })),
      '获取项目列表成功',
    );
  }

  async create(ownerId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        logoUrl: dto.logoUrl,
        ownerId,
      },
    });

    return ok(
      {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt.toISOString(),
        logoUrl: project.logoUrl ?? null,
      },
      '创建项目成功',
    );
  }

  async getById(ownerId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return ok(
      {
        id: project.id,
        name: project.name,
        description: project.description,
        logoUrl: project.logoUrl ?? null,
      },
      '获取项目详情成功',
    );
  }

  async update(ownerId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
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
      },
    });

    // 如果 logo 发生了变化，删除旧文件
    if (project.logoUrl && project.logoUrl !== nextLogoUrl) {
      await this.deleteLogoFile(project.logoUrl);
    }

    return ok(
      {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        logoUrl: updated.logoUrl ?? null,
      },
      '更新项目成功',
    );
  }

  async delete(ownerId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId },
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

