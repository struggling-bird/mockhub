import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RequestLogsModule } from '../request-logs/request-logs.module';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ScriptMockService } from './script-mock.service';

@Module({
  imports: [PrismaModule, RequestLogsModule],
  controllers: [GatewayController],
  providers: [GatewayService, ScriptMockService],
})
export class GatewayModule {}
