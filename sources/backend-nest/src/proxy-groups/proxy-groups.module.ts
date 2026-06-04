import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { ProxyGroupsController } from './proxy-groups.controller';
import { ProxyGroupsService } from './proxy-groups.service';

@Module({
  imports: [PrismaModule, ProjectsModule],
  controllers: [ProxyGroupsController],
  providers: [ProxyGroupsService],
  exports: [ProxyGroupsService],
})
export class ProxyGroupsModule {}
