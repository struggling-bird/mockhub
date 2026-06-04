import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { RequestLogsModule } from '../request-logs/request-logs.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PrismaModule, ProjectsModule, RequestLogsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
