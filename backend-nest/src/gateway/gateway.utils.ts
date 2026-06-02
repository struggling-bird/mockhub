export const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export function normalizeHeaderKey(key: string) {
  return key.trim().toLowerCase();
}

export function isHopByHopHeader(key: string) {
  return HOP_BY_HOP_HEADERS.has(normalizeHeaderKey(key));
}

export function buildSchemaRowsFromJson(
  value: any,
  section: 'body' | 'response',
): any[] {
  const inferScalar = (v: any) => {
    if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
    if (typeof v === 'boolean') return 'boolean';
    if (v === null || v === undefined) return 'string';
    return 'string';
  };

  const rows: any[] = [];

  const walk = (name: string, v: any, depth: number) => {
    if (Array.isArray(v)) {
      rows.push({ name, type: 'array', required: false, desc: '', depth, section });
      if (v.length > 0) {
        walk('item', v[0], depth + 1);
      }
      return;
    }
    if (v && typeof v === 'object') {
      rows.push({ name, type: 'object', required: false, desc: '', depth, section });
      for (const [k, child] of Object.entries(v)) {
        walk(k, child, depth + 1);
      }
      return;
    }
    rows.push({ name, type: inferScalar(v), required: false, desc: '', depth, section });
  };

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) {
      walk(k, v, 0);
    }
    return rows;
  }

  walk('value', value, 0);
  return rows;
}

export function prettyIfJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return text;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return text;
  }
}

export function rewriteSetCookieDomain(
  setCookies: string[],
  mode: 'off' | 'origin' | 'custom',
  originHost: string,
  customDomain?: string | null,
) {
  if (mode === 'off') return setCookies;
  const targetDomain = mode === 'custom' ? (customDomain || originHost) : originHost;

  return setCookies.map((cookie) => {
    const parts = cookie.split(';').map((p) => p.trim());
    const nextParts = parts.map((p) => {
      if (p.toLowerCase().startsWith('domain=')) {
        return `Domain=${targetDomain}`;
      }
      return p;
    });
    // 如果原 cookie 没有 Domain 字段，则不强行添加（host-only cookie 更安全）
    return nextParts.join('; ');
  });
}

