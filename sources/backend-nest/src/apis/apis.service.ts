import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { ApiProxyRequestDto } from './dto/proxy-request.dto';
import { ok } from '../common/api-response';
import { ProjectAccessService } from '../projects/project-access.service';

@Injectable()
export class ApisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectAccess: ProjectAccessService,
  ) {}

  private async ensureProjectReadable(userId: string, projectId: string) {
    return this.projectAccess.ensurePermission(userId, projectId, 'api.view');
  }

  private async ensureProjectPermission(
    userId: string,
    projectId: string,
    permission: Parameters<ProjectAccessService['ensurePermission']>[2],
  ) {
    return this.projectAccess.ensurePermission(userId, projectId, permission);
  }

  async list(ownerId: string, projectId: string) {
    await this.ensureProjectReadable(ownerId, projectId);
    const list = await this.prisma.projectApi.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });
    return ok(
      list.map((api) => ({
        id: api.id,
        name: api.name,
        path: api.path,
        method: api.method,
        status: api.status,
        lastCall: api.updatedAt.toISOString(),
      })),
      '获取接口列表成功',
    );
  }

  async create(ownerId: string, projectId: string, dto: CreateApiDto) {
    await this.ensureProjectPermission(ownerId, projectId, 'api.create');
    const api = await this.prisma.projectApi.create({
      data: {
        projectId,
        name: dto.name,
        path: dto.path,
        method: dto.method,
        status: dto.status ?? 'New',
        requestHeaders: dto.requestHeaders
          ? JSON.stringify(dto.requestHeaders)
          : null,
        requestParams: dto.requestParams
          ? JSON.stringify(dto.requestParams)
          : null,
        responseHeaders: dto.responseHeaders
          ? JSON.stringify(dto.responseHeaders)
          : null,
        responseSchema: dto.responseSchema
          ? JSON.stringify(dto.responseSchema)
          : null,
        mockStaticBody: dto.mockStaticBody ?? null,
        mockScript: dto.mockScript ?? null,
        mockMode: dto.mockMode ?? null,
        mockProxyUrl: dto.mockProxyUrl ?? null,
      },
    });
    return ok(
      {
        id: api.id,
        name: api.name,
        path: api.path,
        method: api.method,
        status: api.status,
        lastCall: api.updatedAt.toISOString(),
        requestHeaders: api.requestHeaders
          ? JSON.parse(api.requestHeaders)
          : null,
        requestParams: api.requestParams
          ? JSON.parse(api.requestParams)
          : null,
        responseHeaders: api.responseHeaders
          ? JSON.parse(api.responseHeaders)
          : null,
        responseSchema: api.responseSchema
          ? JSON.parse(api.responseSchema)
          : null,
        mockStaticBody: api.mockStaticBody,
        mockScript: api.mockScript,
        mockMode: api.mockMode,
        mockProxyUrl: api.mockProxyUrl,
      },
      '创建接口成功',
    );
  }

  async getOne(ownerId: string, projectId: string, apiId: string) {
    await this.ensureProjectReadable(ownerId, projectId);
    const api = await this.prisma.projectApi.findFirst({
      where: { id: apiId, projectId },
    });
    if (!api) {
      throw new NotFoundException('API not found');
    }
    return ok(
      {
        id: api.id,
        name: api.name,
        path: api.path,
        method: api.method,
        status: api.status,
        lastCall: api.updatedAt.toISOString(),
        requestHeaders: api.requestHeaders
          ? JSON.parse(api.requestHeaders)
          : null,
        requestParams: api.requestParams
          ? JSON.parse(api.requestParams)
          : null,
        responseHeaders: api.responseHeaders
          ? JSON.parse(api.responseHeaders)
          : null,
        responseSchema: api.responseSchema
          ? JSON.parse(api.responseSchema)
          : null,
        mockStaticBody: api.mockStaticBody,
        mockScript: api.mockScript,
        mockMode: api.mockMode,
        mockProxyUrl: api.mockProxyUrl,
      },
      '获取接口详情成功',
    );
  }

  async update(
    ownerId: string,
    projectId: string,
    apiId: string,
    dto: UpdateApiDto,
  ) {
    await this.ensureProjectPermission(ownerId, projectId, 'api.update');
    const api = await this.prisma.projectApi.findFirst({
      where: { id: apiId, projectId },
    });
    if (!api) {
      throw new NotFoundException('API not found');
    }
    const updated = await this.prisma.projectApi.update({
      where: { id: apiId },
      data: {
        name: dto.name ?? api.name,
        path: dto.path ?? api.path,
        method: dto.method ?? api.method,
        status: dto.status ?? api.status,
        requestHeaders:
          dto.requestHeaders !== undefined
            ? dto.requestHeaders
              ? JSON.stringify(dto.requestHeaders)
              : null
            : api.requestHeaders,
        requestParams:
          dto.requestParams !== undefined
            ? dto.requestParams
              ? JSON.stringify(dto.requestParams)
              : null
            : api.requestParams,
        responseHeaders:
          dto.responseHeaders !== undefined
            ? dto.responseHeaders
              ? JSON.stringify(dto.responseHeaders)
              : null
            : api.responseHeaders,
        responseSchema:
          dto.responseSchema !== undefined
            ? dto.responseSchema
              ? JSON.stringify(dto.responseSchema)
              : null
            : api.responseSchema,
        mockStaticBody:
          dto.mockStaticBody !== undefined
            ? dto.mockStaticBody
            : api.mockStaticBody,
        mockScript:
          dto.mockScript !== undefined ? dto.mockScript : api.mockScript,
        mockMode: dto.mockMode !== undefined ? dto.mockMode : api.mockMode,
        mockProxyUrl:
          dto.mockProxyUrl !== undefined
            ? dto.mockProxyUrl
            : api.mockProxyUrl,
      },
    });
    return ok(
      {
        id: updated.id,
        name: updated.name,
        path: updated.path,
        method: updated.method,
        status: updated.status,
        lastCall: updated.updatedAt.toISOString(),
        requestHeaders: updated.requestHeaders
          ? JSON.parse(updated.requestHeaders)
          : null,
        requestParams: updated.requestParams
          ? JSON.parse(updated.requestParams)
          : null,
        responseHeaders: updated.responseHeaders
          ? JSON.parse(updated.responseHeaders)
          : null,
        responseSchema: updated.responseSchema
          ? JSON.parse(updated.responseSchema)
          : null,
        mockStaticBody: updated.mockStaticBody,
        mockScript: updated.mockScript,
        mockMode: updated.mockMode,
        mockProxyUrl: updated.mockProxyUrl,
      },
      '更新接口成功',
    );
  }

  async remove(ownerId: string, projectId: string, apiId: string) {
    await this.ensureProjectPermission(ownerId, projectId, 'api.delete');
    const api = await this.prisma.projectApi.findFirst({
      where: { id: apiId, projectId },
    });
    if (!api) {
      throw new NotFoundException('API not found');
    }
    await this.prisma.projectApi.delete({ where: { id: apiId } });
    return ok({ success: true }, '删除接口成功');
  }

  async proxyRequest(
    ownerId: string,
    projectId: string,
    apiId: string,
    dto: ApiProxyRequestDto,
  ) {
    await this.ensureProjectPermission(ownerId, projectId, 'api.proxy');
    const api = await this.prisma.projectApi.findFirst({
      where: { id: apiId, projectId },
      select: { id: true },
    });
    if (!api) {
      throw new NotFoundException('API not found');
    }

    if (!dto.url) {
      throw new BadRequestException('Target URL is required');
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(dto.url);
    } catch {
      throw new BadRequestException('Target URL is invalid');
    }

    Object.entries(dto.query ?? {}).forEach(([key, value]) => {
      if (key) {
        targetUrl.searchParams.set(key, value);
      }
    });

    const headers = new Headers();
    Object.entries(dto.headers ?? {}).forEach(([key, value]) => {
      if (key && value !== undefined) {
        headers.set(key, value);
      }
    });

    const init: RequestInit = {
      method: dto.method || 'GET',
      headers,
      redirect: 'follow',
    };

    if (
      dto.body !== undefined &&
      dto.body !== null &&
      !['GET', 'HEAD'].includes((dto.method || 'GET').toUpperCase())
    ) {
      init.body = dto.body;
    }

    const response = await fetch(targetUrl.toString(), init);
    const body = await response.text();

    return ok(
      {
        status: response.status,
        statusText: response.statusText,
        headers: Array.from(response.headers.entries()).map(([key, value]) => ({
          key,
          value,
        })),
        body,
        contentType: response.headers.get('content-type'),
      },
      '真实代理请求成功',
    );
  }
}
