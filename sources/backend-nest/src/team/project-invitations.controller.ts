import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { AcceptProjectInvitationDto } from './dto/accept-project-invitation.dto';
import { TeamService } from './team.service';

@ApiTags('project-invitations')
@Controller('projects/invitations')
export class ProjectInvitationsController {
  constructor(private readonly teamService: TeamService) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: '获取邀请信息' })
  async invitationDetail(@Param('token') token: string) {
    return this.teamService.invitationDetail(token);
  }

  @ApiBearerAuth()
  @Post('accept')
  @ApiOperation({ summary: '接受项目邀请' })
  async acceptInvitation(
    @Req() req: { userId?: string },
    @Body() dto: AcceptProjectInvitationDto,
  ) {
    return this.teamService.acceptInvitation(req.userId as string, dto.token);
  }
}
