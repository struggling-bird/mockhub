import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProxyGroupDto } from './dto/create-proxy-group.dto';
import { UpdateProxyGroupDto } from './dto/update-proxy-group.dto';
import { ProxyGroupsService } from './proxy-groups.service';

@ApiTags('proxy-groups')
@ApiBearerAuth()
@Controller('projects/:projectId/proxy-groups')
export class ProxyGroupsController {
  constructor(private readonly proxyGroupsService: ProxyGroupsService) {}

  @Get()
  @ApiOperation({ summary: '查询项目代理分组' })
  async list(@Req() req: { userId?: string }, @Param('projectId') projectId: string) {
    return this.proxyGroupsService.list(req.userId as string, projectId);
  }

  @Post()
  @ApiOperation({ summary: '创建项目代理分组' })
  async create(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Body() dto: CreateProxyGroupDto,
  ) {
    return this.proxyGroupsService.create(req.userId as string, projectId, dto);
  }

  @Put(':groupId')
  @ApiOperation({ summary: '更新项目代理分组' })
  async update(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateProxyGroupDto,
  ) {
    return this.proxyGroupsService.update(req.userId as string, projectId, groupId, dto);
  }

  @Delete(':groupId')
  @ApiOperation({ summary: '删除项目代理分组' })
  async remove(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('groupId') groupId: string,
  ) {
    return this.proxyGroupsService.remove(req.userId as string, projectId, groupId);
  }
}
