import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ProjectDetailDto,
  ProjectSummaryDto,
} from './dto/project-response.dto';
import { SimpleSuccessResponseDto } from '../auth/dto/auth-response.dto';
import { ApiResponseEnvelope } from '../common/api-response';

@ApiTags('projects')
@ApiBearerAuth()
@ApiExtraModels(
  ApiResponseEnvelope,
  ProjectSummaryDto,
  ProjectDetailDto,
  SimpleSuccessResponseDto,
)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: '获取我的项目列表',
    description: '根据当前登录用户 ID，返回其拥有的所有项目列表，按创建时间倒序。',
  })
  @ApiResponse({
    status: 200,
    description: '项目列表获取成功。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ProjectSummaryDto) },
              description: '项目列表',
            },
          },
        },
      ],
    },
  })
  async list(@Req() req: any) {
    const ownerId = req.userId as string;
    return this.projectsService.listByOwner(ownerId);
  }

  @Post()
  @ApiOperation({
    summary: '创建项目',
    description: '在当前用户名下创建一个新项目，包含名称、描述与 Logo 信息。',
  })
  @ApiResponse({
    status: 201,
    description: '项目创建成功，返回项目详情。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(ProjectSummaryDto) },
          },
        },
      ],
    },
  })
  async create(@Req() req: any, @Body() dto: CreateProjectDto) {
    const ownerId = req.userId as string;
    return this.projectsService.create(ownerId, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取项目详情',
    description: '根据项目 ID 获取单个项目的详细信息，仅项目所有者可访问。',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功，返回项目详情。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(ProjectDetailDto) },
          },
        },
      ],
    },
  })
  async detail(@Req() req: any, @Param('id') id: string) {
    const ownerId = req.userId as string;
    return this.projectsService.getById(ownerId, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: '更新项目信息',
    description: '更新项目的名称、描述、Logo 等信息，未传字段保持不变。',
  })
  @ApiResponse({
    status: 200,
    description: '更新成功，返回 success 标记。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(SimpleSuccessResponseDto) },
          },
        },
      ],
    },
  })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const ownerId = req.userId as string;
    return this.projectsService.update(ownerId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除项目',
    description: '删除指定项目及其下所有接口配置，此操作不可恢复。',
  })
  @ApiResponse({
    status: 200,
    description: '删除成功，返回 success 标记。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(SimpleSuccessResponseDto) },
          },
        },
      ],
    },
  })
  async remove(@Req() req: any, @Param('id') id: string) {
    const ownerId = req.userId as string;
    return this.projectsService.delete(ownerId, id);
  }
}

