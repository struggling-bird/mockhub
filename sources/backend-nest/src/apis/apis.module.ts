import { Module } from '@nestjs/common';
import { ApisController } from './apis.controller';
import { ApisService } from './apis.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [PrismaModule, ProjectsModule],
  controllers: [ApisController],
  providers: [ApisService],
  exports: [ApisService],
})
export class ApisModule {}
