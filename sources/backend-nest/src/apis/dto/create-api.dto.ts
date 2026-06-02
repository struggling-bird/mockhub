import { ApiProperty } from '@nestjs/swagger';

export class CreateApiDto {
  @ApiProperty({
    description: '接口名称，用于在控制台中展示与检索',
    example: '获取用户详情',
  })
  name: string;

  @ApiProperty({
    description: '接口完整路径，建议统一以 /api/v1 开头',
    example: '/api/v1/user/profile',
  })
  path: string;

  @ApiProperty({
    description: 'HTTP 请求方法',
    example: 'GET',
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
  method: string;

  @ApiProperty({
    example: 'Published',
    description: '接口当前状态：New-新建，Debugged-联调中，To Test-待测试，Published-已发布',
    enum: ['New', 'Debugged', 'To Test', 'Published'],
    required: false,
  })
  status?: string;

  @ApiProperty({
    required: false,
    description: '请求头配置，前端以 JSON 结构传入并在后端序列化存储',
  })
  requestHeaders?: any;

  @ApiProperty({
    required: false,
    description: '请求参数/Body 配置（统一 JSON），前端负责区分 query/body',
  })
  requestParams?: any;

  @ApiProperty({
    required: false,
    description: '响应头配置 JSON',
  })
  responseHeaders?: any;

  @ApiProperty({
    required: false,
    description: '响应结构 Schema JSON',
  })
  responseSchema?: any;

  @ApiProperty({
    required: false,
    description: '静态 Mock JSON 字符串',
  })
  mockStaticBody?: string;

  @ApiProperty({
    required: false,
    description: '动态脚本 Mock 内容',
  })
  mockScript?: string;

  @ApiProperty({
    required: false,
    description: 'Mock 模式：static | script | proxy',
  })
  mockMode?: string;

  @ApiProperty({
    required: false,
    description: '代理真实服务地址，仅 proxy 模式生效',
  })
  mockProxyUrl?: string;
}
