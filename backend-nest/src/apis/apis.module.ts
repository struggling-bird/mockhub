import { Module } from '@nestjs/common';
import { ApisController } from './apis.controller';
import { ApisService } from './apis.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApisController],
  providers: [ApisService],
  exports: [ApisService],
})
export class ApisModule {}
