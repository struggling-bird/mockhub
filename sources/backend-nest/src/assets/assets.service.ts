import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ok } from '../common/api-response';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

export interface AssetSuggestion {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
  source: string;
  count: number;
  confidence: number;
}

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureProjectOwned(ownerId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private normalize(dto: CreateAssetDto | UpdateAssetDto) {
    const normalized: any = {};
    if (dto.name !== undefined) normalized.name = dto.name.trim();
    if (dto.value !== undefined) normalized.value = dto.value.trim();
    if (dto.type !== undefined) normalized.type = dto.type.trim();
    if (dto.category !== undefined) normalized.category = dto.category.trim();
    return normalized;
  }

  private validate(data: any, partial = false) {
    const required = ['name', 'value', 'type', 'category'];
    for (const key of required) {
      if (!partial || data[key] !== undefined) {
        if (!data[key]) {
          throw new BadRequestException(`${key} is required`);
        }
      }
    }
  }

  private toDto(asset: any) {
    return {
      id: asset.id,
      projectId: asset.projectId,
      name: asset.name,
      value: asset.value,
      type: asset.type,
      category: asset.category,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }

  async list(ownerId: string, projectId: string) {
    await this.ensureProjectOwned(ownerId, projectId);
    const assets = await this.prisma.$queryRaw<any[]>`
      SELECT
        id,
        project_id AS projectId,
        name,
        value,
        type,
        category,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM public_assets
      WHERE project_id = ${projectId}
      ORDER BY updated_at DESC
    `;
    return ok(assets.map((asset: any) => this.toDto(asset)), '获取公共资产成功');
  }

  async create(ownerId: string, projectId: string, dto: CreateAssetDto) {
    await this.ensureProjectOwned(ownerId, projectId);
    const data = this.normalize(dto);
    this.validate(data);
    const id = this.createId();
    await this.prisma.$executeRaw`
      INSERT INTO public_assets (id, project_id, name, value, type, category)
      VALUES (${id}, ${projectId}, ${data.name}, ${data.value}, ${data.type}, ${data.category})
    `;
    const asset = await this.findAsset(projectId, id);
    return ok(this.toDto(asset), '创建公共资产成功');
  }

  async suggestions(ownerId: string, projectId: string) {
    await this.ensureProjectOwned(ownerId, projectId);
    const existing = await this.prisma.$queryRaw<{ type: string; value: string }[]>`
      SELECT type, value
      FROM public_assets
      WHERE project_id = ${projectId}
    `;
    const existingKeys = new Set(
      existing.map((asset) => this.suggestionKey(asset.type, asset.value)),
    );

    const suggestions: AssetSuggestion[] = [];
    const addSuggestion = (suggestion: AssetSuggestion) => {
      const key = this.suggestionKey(suggestion.type, suggestion.value);
      if (existingKeys.has(key)) return;
      if (suggestions.some((item) => this.suggestionKey(item.type, item.value) === key)) {
        return;
      }
      suggestions.push(suggestion);
    };

    const proxyUrlRows = await this.prisma.$queryRaw<
      { source: string; value: string | null; count: bigint | number }[]
    >`
      SELECT 'project proxy' AS source, proxy_url AS value, COUNT(*) AS count
      FROM projects
      WHERE id = ${projectId}
        AND proxy_url IS NOT NULL
        AND proxy_url <> ''
      GROUP BY proxy_url
      UNION ALL
      SELECT 'api proxy' AS source, mock_proxy_url AS value, COUNT(*) AS count
      FROM project_apis
      WHERE project_id = ${projectId}
        AND mock_proxy_url IS NOT NULL
        AND mock_proxy_url <> ''
      GROUP BY mock_proxy_url
    `;

    proxyUrlRows.forEach((row) => {
      const baseUrl = this.normalizeBaseUrl(row.value || '');
      if (!baseUrl) return;
      addSuggestion({
        id: this.suggestionId('url', baseUrl),
        name: this.nameFromUrl(baseUrl),
        value: baseUrl,
        type: 'URL',
        category: 'Infrastructure',
        source: row.source,
        count: Number(row.count),
        confidence: Number(row.count) > 1 ? 0.9 : 0.72,
      });
    });

    const statusRows = await this.prisma.$queryRaw<
      { statusCode: number; count: bigint | number }[]
    >`
      SELECT status_code AS statusCode, COUNT(*) AS count
      FROM request_logs
      WHERE project_id = ${projectId}
        AND status_code >= 400
      GROUP BY status_code
      ORDER BY count DESC
      LIMIT 12
    `;
    if (statusRows.length > 0) {
      const items = statusRows.map((row) => ({
        code: String(row.statusCode),
        message: this.defaultStatusMessage(Number(row.statusCode)),
      }));
      addSuggestion({
        id: this.suggestionId('error', JSON.stringify(items)),
        name: 'Observed Error Codes',
        value: JSON.stringify(items, null, 2),
        type: 'ErrorCode',
        category: 'Definitions',
        source: 'proxy request logs',
        count: statusRows.reduce((sum, row) => sum + Number(row.count), 0),
        confidence: statusRows.length > 1 ? 0.82 : 0.68,
      });
    }

    const enumRows = await this.prisma.$queryRaw<
      { method: string; mode: string | null; statusCode: number }[]
    >`
      SELECT method, mode, status_code AS statusCode
      FROM request_logs
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    const methodSet = new Set(enumRows.map((row) => String(row.method)).filter(Boolean));
    if (methodSet.size > 1) {
      const value = Array.from(methodSet).sort().join(', ');
      addSuggestion({
        id: this.suggestionId('enum-methods', value),
        name: 'Observed HTTP Methods',
        value,
        type: 'Enum',
        category: 'Definitions',
        source: 'proxy request logs',
        count: enumRows.length,
        confidence: 0.76,
      });
    }
    const modeSet = new Set(enumRows.map((row) => row.mode).filter(Boolean).map(String));
    if (modeSet.size > 1) {
      const value = Array.from(modeSet).sort().join(', ');
      addSuggestion({
        id: this.suggestionId('enum-modes', value),
        name: 'Observed Mock Modes',
        value,
        type: 'Enum',
        category: 'Definitions',
        source: 'proxy request logs',
        count: enumRows.length,
        confidence: 0.7,
      });
    }

    const apiRows = await this.prisma.$queryRaw<
      {
        name: string;
        path: string;
        requestParams: string | null;
        responseSchema: string | null;
        mockStaticBody: string | null;
      }[]
    >`
      SELECT
        name,
        path,
        request_params AS requestParams,
        response_schema AS responseSchema,
        mock_static_body AS mockStaticBody
      FROM project_apis
      WHERE project_id = ${projectId}
      ORDER BY updated_at DESC
      LIMIT 200
    `;

    const enumCandidates = new Map<
      string,
      { fieldPath: string; values: Set<string>; sources: Set<string>; count: number }
    >();
    const codeCandidates = new Map<
      string,
      { values: Map<string, string>; sources: Set<string>; count: number }
    >();
    const envelopeCandidates = new Map<
      string,
      { template: Record<string, unknown>; sources: Set<string>; count: number }
    >();

    const addEnumValue = (fieldPath: string, value: unknown, source: string) => {
      if (!this.isUsefulEnumValue(value)) return;
      const key = fieldPath.toLowerCase();
      const current =
        enumCandidates.get(key) || {
          fieldPath,
          values: new Set<string>(),
          sources: new Set<string>(),
          count: 0,
        };
      current.values.add(String(value));
      current.sources.add(source);
      current.count += 1;
      enumCandidates.set(key, current);
    };

    const addBusinessCode = (fieldPath: string, value: unknown, source: string, message?: unknown) => {
      if (!this.isUsefulCodeValue(value)) return;
      const key = fieldPath.toLowerCase();
      const current =
        codeCandidates.get(key) || {
          values: new Map<string, string>(),
          sources: new Set<string>(),
          count: 0,
        };
      const code = String(value);
      current.values.set(code, typeof message === 'string' && message ? message : code);
      current.sources.add(source);
      current.count += 1;
      codeCandidates.set(key, current);
    };

    apiRows.forEach((api) => {
      this.parseSchemaRows(api.requestParams).forEach((row: any) => {
        const fieldPath = `request.${row.section || 'params'}.${row.name}`;
        if (this.isEnumFieldName(row.name)) {
          addEnumValue(fieldPath, row.value, `${api.path} request params`);
        }
        if (this.isBusinessCodeFieldName(row.name)) {
          addBusinessCode(fieldPath, row.value, `${api.path} request params`);
        }
      });

      this.parseSchemaRows(api.responseSchema).forEach((row: any) => {
        const fieldPath = `response.${row.name}`;
        if (this.isEnumFieldName(row.name)) {
          addEnumValue(fieldPath, row.value, `${api.path} response schema`);
        }
        if (this.isBusinessCodeFieldName(row.name)) {
          addBusinessCode(fieldPath, row.value, `${api.path} response schema`);
        }
      });

      const mockBody = this.parseJson(api.mockStaticBody);
      if (mockBody && typeof mockBody === 'object') {
        this.detectEnvelope(mockBody).forEach((envelope) => {
          const current =
            envelopeCandidates.get(envelope.signature) || {
              template: envelope.template,
              sources: new Set<string>(),
              count: 0,
            };
          current.sources.add(`${api.path} mock static body`);
          current.count += 1;
          envelopeCandidates.set(envelope.signature, current);
        });

        this.walkJson(mockBody, 'response', (path, key, value, parent) => {
          if (this.isEnumFieldName(key)) {
            addEnumValue(path, value, `${api.path} mock static body`);
          }
          if (this.isBusinessCodeFieldName(key)) {
            addBusinessCode(
              path,
              value,
              `${api.path} mock static body`,
              this.findSiblingMessage(parent),
            );
          }
        });
      }
    });

    enumCandidates.forEach((candidate) => {
      if (candidate.values.size < 2) return;
      const value = Array.from(candidate.values).sort().join(', ');
      addSuggestion({
        id: this.suggestionId(`enum-${candidate.fieldPath}`, value),
        name: `${candidate.fieldPath} Enum`,
        value,
        type: 'Enum',
        category: 'Definitions',
        source: Array.from(candidate.sources).slice(0, 3).join('; '),
        count: candidate.count,
        confidence: Math.min(0.92, 0.62 + candidate.values.size * 0.08),
      });
    });

    codeCandidates.forEach((candidate, fieldPath) => {
      if (candidate.values.size === 0) return;
      const items = Array.from(candidate.values.entries()).map(([code, message]) => ({
        code,
        message,
      }));
      addSuggestion({
        id: this.suggestionId(`business-code-${fieldPath}`, JSON.stringify(items)),
        name: `${candidate.values.size > 1 ? 'Business' : 'Observed'} Response Codes`,
        value: JSON.stringify(items, null, 2),
        type: 'ErrorCode',
        category: 'Definitions',
        source: Array.from(candidate.sources).slice(0, 3).join('; '),
        count: candidate.count,
        confidence: Math.min(0.9, 0.66 + candidate.values.size * 0.06),
      });
    });

    envelopeCandidates.forEach((candidate, signature) => {
      addSuggestion({
        id: this.suggestionId(`envelope-${signature}`, JSON.stringify(candidate.template)),
        name: `${signature} Response Envelope`,
        value: JSON.stringify(candidate.template, null, 2),
        type: 'JSON',
        category: 'Shared Config',
        source: Array.from(candidate.sources).slice(0, 3).join('; '),
        count: candidate.count,
        confidence: Math.min(0.9, 0.72 + candidate.count * 0.04),
      });
    });

    return ok(
      suggestions
        .sort((left, right) => right.confidence - left.confidence || right.count - left.count)
        .slice(0, 20),
      '获取公共资产建议成功',
    );
  }

  async acceptSuggestion(ownerId: string, projectId: string, dto: CreateAssetDto) {
    return this.create(ownerId, projectId, dto);
  }

  async update(ownerId: string, projectId: string, assetId: string, dto: UpdateAssetDto) {
    await this.ensureProjectOwned(ownerId, projectId);
    const existing = await this.findAsset(projectId, assetId);
    if (!existing) {
      throw new NotFoundException('Asset not found');
    }

    const data = this.normalize(dto);
    this.validate(data, true);
    const next = {
      name: data.name ?? existing.name,
      value: data.value ?? existing.value,
      type: data.type ?? existing.type,
      category: data.category ?? existing.category,
    };
    await this.prisma.$executeRaw`
      UPDATE public_assets
      SET name = ${next.name},
          value = ${next.value},
          type = ${next.type},
          category = ${next.category}
      WHERE id = ${assetId}
        AND project_id = ${projectId}
    `;
    const asset = await this.findAsset(projectId, assetId);
    return ok(this.toDto(asset), '更新公共资产成功');
  }

  async remove(ownerId: string, projectId: string, assetId: string) {
    await this.ensureProjectOwned(ownerId, projectId);
    const existing = await this.findAsset(projectId, assetId);
    if (!existing) {
      throw new NotFoundException('Asset not found');
    }

    await this.prisma.$executeRaw`
      DELETE FROM public_assets
      WHERE id = ${assetId}
        AND project_id = ${projectId}
    `;
    return ok({ success: true }, '删除公共资产成功');
  }

  private async findAsset(projectId: string, assetId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        id,
        project_id AS projectId,
        name,
        value,
        type,
        category,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM public_assets
      WHERE id = ${assetId}
        AND project_id = ${projectId}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  private createId() {
    return `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private normalizeBaseUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      const url = new URL(trimmed);
      return `${url.protocol}//${url.host}`;
    } catch {
      return trimmed.replace(/\/+$/, '');
    }
  }

  private nameFromUrl(value: string) {
    try {
      const url = new URL(value);
      return `${url.host} Base URL`;
    } catch {
      return 'Observed Base URL';
    }
  }

  private defaultStatusMessage(statusCode: number) {
    const messages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };
    return messages[statusCode] || `HTTP ${statusCode}`;
  }

  private suggestionKey(type: string, value: string) {
    return `${type.trim().toLowerCase()}::${value.trim().toLowerCase()}`;
  }

  private suggestionId(scope: string, value: string) {
    const normalized = value.trim().toLowerCase();
    let hash = 0;
    for (let index = 0; index < normalized.length; index += 1) {
      hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
    }
    return `suggest_${scope}_${hash.toString(36)}`;
  }

  private parseSchemaRows(value: string | null | undefined) {
    const parsed = this.parseJson(value);
    return Array.isArray(parsed) ? parsed : [];
  }

  private parseJson(value: string | null | undefined) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private isEnumFieldName(name: unknown) {
    const normalized = String(name || '').toLowerCase();
    return /(status|state|type|role|channel|mode|method|level|kind|category)/.test(normalized);
  }

  private isBusinessCodeFieldName(name: unknown) {
    const normalized = String(name || '').toLowerCase();
    return /(^code$|errorcode|resultcode|statuscode|bizcode|retcode|returncode|responsecode|^status$)/.test(
      normalized,
    );
  }

  private isUsefulEnumValue(value: unknown) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'object') return false;
    const text = String(value).trim();
    if (!text || text.length > 64) return false;
    if (/^https?:\/\//i.test(text)) return false;
    return true;
  }

  private isUsefulCodeValue(value: unknown) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'object') return false;
    const text = String(value).trim();
    return Boolean(text && text.length <= 64);
  }

  private walkJson(
    value: unknown,
    path: string,
    visitor: (path: string, key: string, value: unknown, parent: unknown) => void,
  ) {
    if (Array.isArray(value)) {
      value.slice(0, 5).forEach((item, index) => this.walkJson(item, `${path}[${index}]`, visitor));
      return;
    }
    if (!value || typeof value !== 'object') return;
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      const childPath = `${path}.${key}`;
      visitor(childPath, key, child, value);
      this.walkJson(child, childPath, visitor);
    });
  }

  private findSiblingMessage(parent: unknown) {
    if (!parent || typeof parent !== 'object' || Array.isArray(parent)) return undefined;
    const record = parent as Record<string, unknown>;
    return record.message || record.msg || record.errorMessage || record.desc || record.description;
  }

  private detectEnvelope(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const record = value as Record<string, unknown>;
    const keys = new Set(Object.keys(record).map((key) => key.toLowerCase()));
    const envelopes: { signature: string; template: Record<string, unknown> }[] = [];

    if (keys.has('code') && keys.has('message') && keys.has('data')) {
      envelopes.push({
        signature: 'code-message-data',
        template: {
          code: record.code ?? '0',
          message: record.message ?? 'success',
          data: this.templateValue(record.data),
        },
      });
    }
    if (keys.has('success') && keys.has('data') && keys.has('error')) {
      envelopes.push({
        signature: 'success-data-error',
        template: {
          success: record.success ?? true,
          data: this.templateValue(record.data),
          error: this.templateValue(record.error),
        },
      });
    }
    if (keys.has('status') && keys.has('message') && keys.has('data')) {
      envelopes.push({
        signature: 'status-message-data',
        template: {
          status: record.status ?? 'success',
          message: record.message ?? 'success',
          data: this.templateValue(record.data),
        },
      });
    }

    return envelopes;
  }

  private templateValue(value: unknown): unknown {
    if (Array.isArray(value)) return [];
    if (value && typeof value === 'object') return {};
    if (typeof value === 'number') return 0;
    if (typeof value === 'boolean') return false;
    return '';
  }
}
