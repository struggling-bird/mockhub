import { describeGatewayBody, getGatewayBodyBuffer } from './gateway.body';

describe('gateway body helpers', () => {
  it('keeps raw Buffer request bodies for forwarding', () => {
    const body = Buffer.from('{"name":"mockhub"}', 'utf8');

    expect(getGatewayBodyBuffer({ body } as any)).toBe(body);
  });

  it('serializes parsed object request bodies for forwarding', () => {
    const body = getGatewayBodyBuffer({
      body: { name: 'mockhub', ok: true },
    } as any);

    expect(body?.toString('utf8')).toBe('{"name":"mockhub","ok":true}');
  });

  it('serializes string request bodies for forwarding', () => {
    const body = getGatewayBodyBuffer({ body: 'hello' } as any);

    expect(body?.toString('utf8')).toBe('hello');
  });

  it('returns undefined for empty request bodies', () => {
    expect(getGatewayBodyBuffer({ body: undefined } as any)).toBeUndefined();
    expect(getGatewayBodyBuffer({ body: null } as any)).toBeUndefined();
  });

  it('describes body type and forward size for logs', () => {
    expect(
      describeGatewayBody(
        { body: { name: 'mockhub' } } as any,
        Buffer.from('{"name":"mockhub"}', 'utf8'),
      ),
    ).toBe('rawBodyType=object forwardBodyBytes=18');
  });
});
