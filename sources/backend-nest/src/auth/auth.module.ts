import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamModule } from '../team/team.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [PrismaModule, TeamModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
