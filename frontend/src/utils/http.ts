export interface ApiEnvelope<T = any> {
  code: string;
  message: string;
  data: T | null;
  traceId?: string;
}

export class ApiError extends Error {
  code?: string;
  status: number;
  traceId?: string;

  constructor(message: string, status: number, code?: string, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.traceId = traceId;
  }
}

interface RequestOptions extends RequestInit {
  /**
   * 是否自动附带本地存储中的 Bearer Token，默认 true
   */
  withAuth?: boolean;
}

export async function request<T = any>(
  input: string,
  init?: RequestOptions,
): Promise<T> {
  const { withAuth = true, headers, ...rest } = init || {};

  const mergedHeaders: HeadersInit = {
    ...(headers || {}),
  };

  if (withAuth) {
    const token = window.localStorage.getItem('mockhub_token');
    if (token) {
      (mergedHeaders as any).Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(input, {
    ...rest,
    headers: mergedHeaders,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    // 非 JSON 响应（如文件下载），直接返回原始 Response，由调用方自行处理
    if (!res.ok) {
      throw new ApiError(res.statusText || '请求失败', res.status);
    }
    // @ts-expect-error 允许调用方拿到 Response
    return (res as unknown) as T;
  }

  const body = (await res.json().catch(() => ({}))) as Partial<
    ApiEnvelope<T>
  > &
    Record<string, any>;

  const code = body.code ?? (res.ok ? '0' : undefined);
  const message = body.message || res.statusText || '请求失败';
  const traceId = body.traceId;

  if (!res.ok || code !== '0') {
    throw new ApiError(message, res.status, code, traceId);
  }

  return (body.data ?? ({} as T)) as T;
}

