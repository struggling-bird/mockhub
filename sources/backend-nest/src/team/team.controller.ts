import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CreateProjectRoleDto } from './dto/create-project-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { UpdateProjectRoleDto } from './dto/update-project-role.dto';
import { TeamService } from './team.service';

@ApiTags('team')
@ApiBearerAuth()
@Controller('projects/:projectId/members')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @ApiOperation({ summary: '获取项目成员列表' })
  async list(@Req() req: { userId?: string }, @Param('projectId') projectId: string) {
    return this.teamService.list(req.userId as string, projectId);
  }

  @Get('roles/permissions')
  @ApiOperation({ summary: '获取项目角色权限配置' })
  async rolePermissions(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
  ) {
    return this.teamService.rolePermissions(req.userId as string, projectId);
  }

  @Put('roles/permissions')
  @ApiOperation({ summary: '保存项目角色权限配置' })
  async updateRolePermissions(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.teamService.updateRolePermissions(req.userId as string, projectId, dto);
  }

  @Get('roles')
  @ApiOperation({ summary: '获取项目角色列表' })
  async roles(@Req() req: { userId?: string }, @Param('projectId') projectId: string) {
    return this.teamService.roles(req.userId as string, projectId);
  }

  @Post('roles')
  @ApiOperation({ summary: '新增项目角色' })
  async createRole(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectRoleDto,
  ) {
    return this.teamService.createRole(req.userId as string, projectId, dto);
  }

  @Post('roles/:roleKey/copy')
  @ApiOperation({ summary: '复制项目角色' })
  async copyRole(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('roleKey') roleKey: string,
  ) {
    return this.teamService.copyRole(req.userId as string, projectId, roleKey);
  }

  @Put('roles/:roleKey')
  @ApiOperation({ summary: '更新项目角色' })
  async updateRole(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('roleKey') roleKey: string,
    @Body() dto: UpdateProjectRoleDto,
  ) {
    return this.teamService.updateRole(req.userId as string, projectId, roleKey, dto);
  }

  @Delete('roles/:roleKey')
  @ApiOperation({ summary: '删除项目角色' })
  async deleteRole(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('roleKey') roleKey: string,
  ) {
    return this.teamService.deleteRole(req.userId as string, projectId, roleKey);
  }

  @Post()
  @ApiOperation({ summary: '邀请项目成员' })
  async add(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.teamService.add(req.userId as string, projectId, dto);
  }

  @Delete('invitations/:invitationId')
  @ApiOperation({ summary: '撤销项目邀请' })
  async revokeInvitation(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.teamService.revokeInvitation(req.userId as string, projectId, invitationId);
  }

  @Put(':memberId')
  @ApiOperation({ summary: '更新项目成员角色或状态' })
  async update(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateProjectMemberDto,
  ) {
    return this.teamService.update(req.userId as string, projectId, memberId, dto);
  }

  @Delete(':memberId')
  @ApiOperation({ summary: '移除项目成员' })
  async remove(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.teamService.remove(req.userId as string, projectId, memberId);
  }
}
