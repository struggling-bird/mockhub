import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectAccessService } from './project-access.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectAccessService],
  exports: [ProjectsService, ProjectAccessService],
})
export class ProjectsModule {}
