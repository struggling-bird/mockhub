import type { FastifyRequest } from 'fastify';

export function getGatewayBodyBuffer(req: Pick<FastifyRequest, 'body'>) {
  const rawBody = req.body as any;
  if (rawBody === undefined || rawBody === null) {
    return undefined;
  }
  if (Buffer.isBuffer(rawBody)) {
    return rawBody;
  }
  if (typeof rawBody === 'string') {
    return Buffer.from(rawBody, 'utf8');
  }
  if (typeof rawBody === 'object') {
    return Buffer.from(JSON.stringify(rawBody), 'utf8');
  }
  return Buffer.from(String(rawBody), 'utf8');
}

export function describeGatewayBody(req: Pick<FastifyRequest, 'body'>, body?: Buffer) {
  const rawBody = req.body as any;
  const rawType = Buffer.isBuffer(rawBody)
    ? 'buffer'
    : rawBody === null
      ? 'null'
      : typeof rawBody;
  return `rawBodyType=${rawType} forwardBodyBytes=${body?.length ?? 0}`;
}
