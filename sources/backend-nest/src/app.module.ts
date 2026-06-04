import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadModule } from './upload/upload.module';
import { ApisModule } from './apis/apis.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GatewayModule } from './gateway/gateway.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AssetsModule } from './assets/assets.module';
import { TeamModule } from './team/team.module';
import { ProxyGroupsModule } from './proxy-groups/proxy-groups.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    ProjectsModule,
    UploadModule,
    ApisModule,
    GatewayModule,
    DashboardModule,
    AssetsModule,
    TeamModule,
    ProxyGroupsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
