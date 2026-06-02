import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RequestLogsService } from './request-logs.service';

@Module({
  imports: [PrismaModule],
  providers: [RequestLogsService],
  exports: [RequestLogsService],
})
export class RequestLogsModule {}
