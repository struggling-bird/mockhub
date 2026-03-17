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
import { ApisService } from './apis.service';
import { CreateApiDto } from './dto/create-api.dto';
import { UpdateApiDto } from './dto/update-api.dto';
import { ApiDetailDto, ApiListItemDto } from './dto/api-response.dto';
import { SimpleSuccessResponseDto } from '../auth/dto/auth-response.dto';
import { ApiResponseEnvelope } from '../common/api-response';

@ApiTags('apis')
@ApiBearerAuth()
@ApiExtraModels(
  ApiResponseEnvelope,
  ApiListItemDto,
  ApiDetailDto,
  SimpleSuccessResponseDto,
)
@Controller('projects/:projectId/apis')
export class ApisController {
  constructor(private readonly apisService: ApisService) {}

  @Get()
  @ApiOperation({
    summary: '获取项目下的接口列表',
    description:
      '按更新时间倒序返回指定项目下的所有接口基础信息，仅包含名称、路径、方法、状态等摘要字段。',
  })
  @ApiResponse({
    status: 200,
    description: '接口列表获取成功。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(ApiListItemDto) },
              description: '接口列表',
            },
          },
        },
      ],
    },
  })
  async list(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
  ) {
    const userId = req.userId as string;
    return this.apisService.list(userId, projectId);
  }

  @Post()
  @ApiOperation({
    summary: '创建接口',
    description:
      '在指定项目下创建一个新接口，仅写入基础信息和文档/Mock 配置，不包含实际转发逻辑。',
  })
  @ApiResponse({
    status: 201,
    description: '接口创建成功，返回接口详情。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(ApiDetailDto) },
          },
        },
      ],
    },
  })
  async create(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Body() dto: CreateApiDto,
  ) {
    const userId = req.userId as string;
    return this.apisService.create(userId, projectId, dto);
  }

  @Get(':apiId')
  @ApiOperation({
    summary: '获取接口详情',
    description:
      '根据接口 ID 获取完整的接口配置，包括请求头、请求参数结构、响应头、响应结构以及 Mock 配置等。',
  })
  @ApiResponse({
    status: 200,
    description: '接口详情获取成功。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(ApiDetailDto) },
          },
        },
      ],
    },
  })
  async getOne(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('apiId') apiId: string,
  ) {
    const userId = req.userId as string;
    return this.apisService.getOne(userId, projectId, apiId);
  }

  @Put(':apiId')
  @ApiOperation({
    summary: '更新接口配置',
    description:
      '更新接口的基础信息和文档/Mock 配置，未传字段保持原值，用于接口调试与维护。',
  })
  @ApiResponse({
    status: 200,
    description: '更新成功，返回最新的接口详情。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(ApiDetailDto) },
          },
        },
      ],
    },
  })
  async update(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('apiId') apiId: string,
    @Body() dto: UpdateApiDto,
  ) {
    const userId = req.userId as string;
    return this.apisService.update(userId, projectId, apiId, dto);
  }

  @Delete(':apiId')
  @ApiOperation({
    summary: '删除接口',
    description: '删除指定接口配置，此操作不可恢复。',
  })
  @ApiResponse({
    status: 200,
    description: '删除成功。',
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
  async remove(
    @Req() req: { userId?: string },
    @Param('projectId') projectId: string,
    @Param('apiId') apiId: string,
  ) {
    const userId = req.userId as string;
    return this.apisService.remove(userId, projectId, apiId);
  }
}
