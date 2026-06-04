import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [PrismaModule, ProjectsModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
