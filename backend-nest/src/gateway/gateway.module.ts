import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [PrismaModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}

