import { All, Controller, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Public } from '../auth/public.decorator';
import { GatewayService } from './gateway.service';

@Public()
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  async handle(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const result = await this.gatewayService.handleGateway(req);

    if (result.kind === 'static') {
      reply.status(result.static.status);
      Object.entries(result.static.headers).forEach(([key, value]) => {
        reply.header(key, value as any);
      });
      return reply.send(result.static.body);
    }

    const proxy = result.proxy;
    reply.status(proxy.status);
    Object.entries(proxy.headers).forEach(([key, value]) => {
      reply.header(key, value as any);
    });
    return reply.send(proxy.body);
  }
}

