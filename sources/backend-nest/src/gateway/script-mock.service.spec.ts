import { BadRequestException } from '@nestjs/common';
import { ScriptMockService } from './script-mock.service';

describe('ScriptMockService', () => {
  let service: ScriptMockService;

  const request = {
    method: 'GET',
    path: '/api/v1/user',
    url: '/api/v1/user?id=test',
    headers: { accept: 'application/json' },
    query: { id: 'test' },
    body: null,
    bodyText: null,
  };

  beforeEach(() => {
    service = new ScriptMockService();
  });

  it('executes export default scripts with response helpers', async () => {
    const result = await service.execute(
      `
export default function(req, res) {
  return res.status(201).setHeader('x-mock-mode', 'script').json({
    id: req.query.id,
    ok: true
  });
}
      `,
      request,
    );

    expect(result.status).toBe(201);
    expect(result.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(result.headers['x-mock-mode']).toBe('script');
    expect(JSON.parse(result.body.toString('utf8'))).toEqual({
      id: 'test',
      ok: true,
    });
  });

  it('wraps inline scripts and returns plain objects as json', async () => {
    const result = await service.execute(
      `
response.status(202);
return { method: request.method, path: request.path };
      `,
      request,
    );

    expect(result.status).toBe(202);
    expect(result.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(JSON.parse(result.body.toString('utf8'))).toEqual({
      method: 'GET',
      path: '/api/v1/user',
    });
  });

  it('returns text responses', async () => {
    const result = await service.execute(
      `module.exports = function(_req, res) { return res.status(418).text('teapot'); }`,
      request,
    );

    expect(result.status).toBe(418);
    expect(result.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(result.body.toString('utf8')).toBe('teapot');
  });

  it('rejects scripts that exceed the execution timeout', async () => {
    await expect(
      service.execute(`while (true) {}`, request),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not expose process or require', async () => {
    const result = await service.execute(
      `return { hasProcess: typeof process, hasRequire: typeof require };`,
      request,
    );

    expect(JSON.parse(result.body.toString('utf8'))).toEqual({
      hasProcess: 'undefined',
      hasRequire: 'undefined',
    });
  });
});
