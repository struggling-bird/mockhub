import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { TeamController } from './team.controller';
import { ProjectInvitationsController } from './project-invitations.controller';
import { TeamService } from './team.service';

@Module({
  imports: [PrismaModule, ProjectsModule],
  controllers: [TeamController, ProjectInvitationsController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
