import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildSchemaRowsFromJson,
  isHopByHopHeader,
  normalizeHeaderKey,
  prettyIfJson,
  rewriteSetCookieDomain,
} from './gateway.utils';

type MockMode = 'static' | 'script' | 'proxy';

@Injectable()
export class GatewayService {
  constructor(private readonly prisma: PrismaService) {}

  private getMockKey(req: FastifyRequest): string | null {
    const header = (req.headers as any)['x-mock-key'];
    if (Array.isArray(header)) return header[0] || null;
    return typeof header === 'string' ? header : null;
  }

  private stripGatewayPrefix(url: string) {
    return url.startsWith('/gateway') ? url.slice('/gateway'.length) || '/' : url;
  }

  private async findProjectByMockKey(mockKey: string) {
    const project = await (this.prisma as any).project.findFirst({
      where: { mockKey },
    });
    if (!project) {
      throw new UnauthorizedException('Invalid mock key');
    }
    return project as any;
  }

  private async findApi(projectId: string, method: string, pathname: string) {
    const api = await (this.prisma as any).projectApi.findFirst({
      where: { projectId, method, path: pathname },
    });
    return api as any | null;
  }

  private toHeaderRows(headers: Record<string, any>) {
    return Object.entries(headers)
      .filter(([key, value]) => {
        const k = normalizeHeaderKey(key);
        if (!k) return false;
        if (k === 'host' || k === 'content-length') return false;
        if (k === 'x-mock-key') return false;
        return !isHopByHopHeader(k);
      })
      .map(([key, value]) => ({
        key,
        value: Array.isArray(value) ? String(value[0]) : String(value ?? ''),
        desc: '',
      }));
  }

  private parseQuerySchema(searchParams: URLSearchParams) {
    const rows: any[] = [];
    for (const [key] of searchParams.entries()) {
      rows.push({
        name: key,
        type: 'string',
        required: false,
        desc: '',
        depth: 0,
        section: 'query',
      });
    }
    return rows;
  }

  private parseBodySchema(bodyBuffer?: Buffer) {
    if (!bodyBuffer || bodyBuffer.length === 0) return [];
    const text = bodyBuffer.toString('utf8');
    const trimmed = text.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return buildSchemaRowsFromJson(parsed, 'body');
    } catch {
      return [
        {
          name: 'body',
          type: 'string',
          required: false,
          desc: '',
          depth: 0,
          section: 'body',
        },
      ];
    }
  }

  private decideMode(project: any, api: any | null): MockMode {
    const mode = (api?.mockMode as MockMode | undefined) ?? (project.defaultMockMode as MockMode | undefined) ?? 'static';
    if (mode === 'script' || mode === 'proxy' || mode === 'static') return mode;
    return 'static';
  }

  private resolveTargetBase(project: any, api: any | null): string | null {
    return (api?.mockProxyUrl as string | null) || (project.proxyUrl as string | null) || null;
  }

  private buildForwardHeaders(req: FastifyRequest) {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers as any)) {
      const k = normalizeHeaderKey(key);
      if (!k) continue;
      if (k === 'host' || k === 'content-length') continue;
      if (k === 'x-mock-key') continue;
      if (isHopByHopHeader(k)) continue;
      if (k === 'accept-encoding') continue;

      if (Array.isArray(value)) {
        if (value.length > 0) out[key] = String(value[0]);
      } else if (value !== undefined) {
        out[key] = String(value);
      }
    }
    return out;
  }

  private async forwardToUpstream(args: {
    req: FastifyRequest;
    targetUrl: string;
    body?: Buffer;
    cookieRewrite?: { mode: 'off' | 'origin' | 'custom'; customDomain?: string | null };
  }) {
    const { req, targetUrl, body, cookieRewrite } = args;

    const headers = this.buildForwardHeaders(req);
    const method = (req.method || 'GET').toUpperCase();

    const init: RequestInit = {
      method,
      headers,
      redirect: 'follow',
    };

    if (!['GET', 'HEAD'].includes(method) && body && body.length > 0) {
      (init as any).body = body;
    }

    const res = await fetch(targetUrl, init);
    const buf = Buffer.from(await res.arrayBuffer());

    const hopFilteredHeaders: Record<string, string | string[]> = {};
    const setCookiesRaw =
      typeof (res.headers as any).getSetCookie === 'function'
        ? ((res.headers as any).getSetCookie() as string[])
        : res.headers.get('set-cookie')
          ? [String(res.headers.get('set-cookie'))]
          : [];

    // 普通 headers（set-cookie 走单独处理）
    res.headers.forEach((value, key) => {
      const k = normalizeHeaderKey(key);
      if (!k) return;
      if (k === 'set-cookie') return;
      if (isHopByHopHeader(k)) return;
      hopFilteredHeaders[key] = value;
    });

    let setCookies = setCookiesRaw;
    if (setCookies.length > 0 && cookieRewrite && cookieRewrite.mode !== 'off') {
      const originHost = String((req.headers as any).host || '').split(':')[0] || 'localhost';
      setCookies = rewriteSetCookieDomain(
        setCookies,
        cookieRewrite.mode,
        originHost,
        cookieRewrite.customDomain,
      );
    }
    if (setCookies.length > 0) {
      hopFilteredHeaders['set-cookie'] = setCookies;
    }

    return {
      status: res.status,
      statusText: res.statusText,
      headers: hopFilteredHeaders,
      body: buf,
      contentType: res.headers.get('content-type') || null,
      bodyTextUtf8: buf.toString('utf8'),
    };
  }

  private async autoCreateApiFromTraffic(args: {
    projectId: string;
    method: string;
    pathname: string;
    requestHeaders: any[];
    requestParams: any[];
    responseHeaders: any[];
    responseSchema: any[];
    mockStaticBody: string;
    mockMode: MockMode;
    mockProxyUrl?: string | null;
  }) {
    const {
      projectId,
      method,
      pathname,
      requestHeaders,
      requestParams,
      responseHeaders,
      responseSchema,
      mockStaticBody,
      mockMode,
      mockProxyUrl,
    } = args;

    const name = `${method} ${pathname}`;

    const created = await (this.prisma as any).projectApi.create({
      data: {
        projectId,
        name,
        path: pathname,
        method,
        status: 'Debugged',
        requestHeaders: requestHeaders.length ? JSON.stringify(requestHeaders) : null,
        requestParams: requestParams.length ? JSON.stringify(requestParams) : null,
        responseHeaders: responseHeaders.length ? JSON.stringify(responseHeaders) : null,
        responseSchema: responseSchema.length ? JSON.stringify(responseSchema) : null,
        mockStaticBody: mockStaticBody || null,
        mockMode,
        mockProxyUrl: mockProxyUrl || null,
      },
    });

    return created as any;
  }

  async handleGateway(req: FastifyRequest) {
    const mockKey = this.getMockKey(req);
    if (!mockKey) {
      throw new UnauthorizedException('Missing x-mock-key header');
    }

    const project = await this.findProjectByMockKey(mockKey);

    const rawUrl = this.stripGatewayPrefix(req.url || '/');
    const base = 'http://mockhub.local';
    const parsedUrl = new URL(rawUrl, base);
    const pathname = parsedUrl.pathname || '/';
    const method = (req.method || 'GET').toUpperCase();

    const api = await this.findApi(project.id, method, pathname);
    const mode = this.decideMode(project, api);

    // 接口不存在：自动代理学习并创建
    if (!api) {
      const targetBase = this.resolveTargetBase(project, null);
      if (!targetBase) {
        throw new BadRequestException('Project proxyUrl is not configured');
      }

      const targetUrl = new URL(`${pathname}${parsedUrl.search}`, targetBase).toString();
      const bodyBuf = (req.body as any) instanceof Buffer ? (req.body as Buffer) : undefined;

      const proxyRes = await this.forwardToUpstream({
        req,
        targetUrl,
        body: bodyBuf,
        cookieRewrite: {
          mode: (project.cookieRewriteMode as any) || 'off',
          customDomain: project.cookieRewriteDomain ?? null,
        },
      });

      const requestHeaderRows = this.toHeaderRows(req.headers as any);
      const requestParams = [
        ...this.parseQuerySchema(parsedUrl.searchParams),
        ...this.parseBodySchema(bodyBuf),
      ];

      const responseHeaderRows = Object.entries(proxyRes.headers)
        .flatMap(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map((v) => ({ key, value: String(v), desc: '' }));
          }
          return [{ key, value: String(value), desc: '' }];
        });

      let responseSchema: any[] = [];
      const responseBodyPretty = prettyIfJson(proxyRes.bodyTextUtf8);
      try {
        const maybeJson = JSON.parse(proxyRes.bodyTextUtf8);
        responseSchema = buildSchemaRowsFromJson(maybeJson, 'response');
      } catch {
        responseSchema = [];
      }

      const nextMode: MockMode =
        (project.defaultMockMode as MockMode) || 'static';

      await this.autoCreateApiFromTraffic({
        projectId: project.id,
        method,
        pathname,
        requestHeaders: requestHeaderRows,
        requestParams,
        responseHeaders: responseHeaderRows,
        responseSchema,
        mockStaticBody: responseBodyPretty,
        mockMode: nextMode,
        mockProxyUrl: project.proxyUrl ?? null,
      });

      return {
        kind: 'proxy' as const,
        proxy: proxyRes,
      };
    }

    // 接口存在：按策略返回
    if (mode === 'static') {
      const body = (api.mockStaticBody as string | null) ?? '{}';
      return {
        kind: 'static' as const,
        static: {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8' },
          body: Buffer.from(body, 'utf8'),
        },
      };
    }

    if (mode === 'script') {
      // TODO: 后续接入脚本引擎
      throw new NotFoundException('Script mode is not implemented yet');
    }

    // proxy
    const targetBase = this.resolveTargetBase(project, api);
    if (!targetBase) {
      throw new BadRequestException('Project proxyUrl is not configured');
    }
    const targetUrl = new URL(`${pathname}${parsedUrl.search}`, targetBase).toString();
    const bodyBuf = (req.body as any) instanceof Buffer ? (req.body as Buffer) : undefined;

    const proxyRes = await this.forwardToUpstream({
      req,
      targetUrl,
      body: bodyBuf,
      cookieRewrite: {
        mode: (project.cookieRewriteMode as any) || 'off',
        customDomain: project.cookieRewriteDomain ?? null,
      },
    });

    // 已存在接口：可选自动学习更新（项目级开关）
    if ((project.autoCapture as any) === true) {
      try {
        const requestHeaderRows = this.toHeaderRows(req.headers as any);
        const requestParams = [
          ...this.parseQuerySchema(parsedUrl.searchParams),
          ...this.parseBodySchema(bodyBuf),
        ];

        const responseHeaderRows = Object.entries(proxyRes.headers).flatMap(
          ([key, value]) => {
            if (Array.isArray(value)) {
              return value.map((v) => ({ key, value: String(v), desc: '' }));
            }
            return [{ key, value: String(value), desc: '' }];
          },
        );

        const responseBodyPretty = prettyIfJson(proxyRes.bodyTextUtf8);
        let responseSchema: any[] = [];
        try {
          const maybeJson = JSON.parse(proxyRes.bodyTextUtf8);
          responseSchema = buildSchemaRowsFromJson(maybeJson, 'response');
        } catch {
          responseSchema = [];
        }

        await (this.prisma as any).projectApi.update({
          where: { id: api.id },
          data: {
            requestHeaders: requestHeaderRows.length
              ? JSON.stringify(requestHeaderRows)
              : null,
            requestParams: requestParams.length ? JSON.stringify(requestParams) : null,
            responseHeaders: responseHeaderRows.length
              ? JSON.stringify(responseHeaderRows)
              : null,
            responseSchema: responseSchema.length ? JSON.stringify(responseSchema) : null,
            mockStaticBody: responseBodyPretty || null,
          },
        });
      } catch {
        // 自动学习更新失败不影响本次真实代理返回
      }
    }

    return {
      kind: 'proxy' as const,
      proxy: proxyRes,
    };
  }
}

