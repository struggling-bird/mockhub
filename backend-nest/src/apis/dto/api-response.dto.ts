import { ApiProperty } from '@nestjs/swagger';

export class ApiListItemDto {
  @ApiProperty({
    description: '接口唯一 ID',
    example: 'api_123456',
  })
  id: string;

  @ApiProperty({
    description: '接口名称',
    example: '获取用户详情',
  })
  name: string;

  @ApiProperty({
    description: '接口路径',
    example: '/api/v1/user/profile',
  })
  path: string;

  @ApiProperty({
    description: 'HTTP 请求方法',
    example: 'GET',
  })
  method: string;

  @ApiProperty({
    description: '接口状态',
    example: 'Published',
  })
  status: string;

  @ApiProperty({
    description: '最近一次变更或调用时间（字符串，前端自行格式化展示）',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastCall: string;
}

export class ApiHeaderRowDto {
  @ApiProperty({
    description: '请求/响应头键名',
    example: 'Content-Type',
  })
  key: string;

  @ApiProperty({
    description: '键对应的值',
    example: 'application/json',
  })
  value: string;

  @ApiProperty({
    description: '字段含义说明',
    example: '请求体的媒体类型',
    required: false,
  })
  desc?: string;
}

export class ApiSchemaRowDto {
  @ApiProperty({
    description: '字段名称，支持嵌套结构',
    example: 'user.id',
  })
  name: string;

  @ApiProperty({
    description: '字段类型',
    example: 'string',
  })
  type: string;

  @ApiProperty({
    description: '是否必填',
    example: true,
  })
  required: boolean;

  @ApiProperty({
    description: '字段描述',
    example: '用户唯一 ID',
    required: false,
  })
  desc?: string;

  @ApiProperty({
    description: '嵌套层级，用于前端缩进展示',
    example: 1,
    required: false,
  })
  depth?: number;

  @ApiProperty({
    description: '所属区域：query/body/response',
    example: 'query',
    required: false,
  })
  section?: string;
}

export class ApiDetailDto extends ApiListItemDto {
  @ApiProperty({
    description: '请求头配置列表',
    type: [ApiHeaderRowDto],
    required: false,
  })
  requestHeaders?: ApiHeaderRowDto[] | null;

  @ApiProperty({
    description: '请求参数与 Body 结构配置',
    type: [ApiSchemaRowDto],
    required: false,
  })
  requestParams?: ApiSchemaRowDto[] | null;

  @ApiProperty({
    description: '响应头配置列表',
    type: [ApiHeaderRowDto],
    required: false,
  })
  responseHeaders?: ApiHeaderRowDto[] | null;

  @ApiProperty({
    description: '响应结构 Schema 配置',
    type: [ApiSchemaRowDto],
    required: false,
  })
  responseSchema?: ApiSchemaRowDto[] | null;

  @ApiProperty({
    description: '静态 Mock JSON 数据',
    example:
      '{\n  "status": "success",\n  "data": { "id": "user_1", "name": "张三" }\n}',
    required: false,
  })
  mockStaticBody?: string | null;

  @ApiProperty({
    description: '动态脚本 Mock 内容',
    example: 'export default function(req, res) { return res.json({ ok: true }); }',
    required: false,
  })
  mockScript?: string | null;

  @ApiProperty({
    description: 'Mock 模式：static | script | proxy',
    example: 'static',
    required: false,
  })
  mockMode?: string | null;

  @ApiProperty({
    description: '真实服务代理地址，仅在 proxy 模式下生效',
    example: 'https://api.example.com',
    required: false,
  })
  mockProxyUrl?: string | null;
}

