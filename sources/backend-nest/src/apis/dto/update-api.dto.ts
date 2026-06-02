import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApiDto {
  @ApiPropertyOptional({
    description: '接口名称，未传则保持原值',
    example: '获取用户详情（带缓存）',
  })
  name?: string;

  @ApiPropertyOptional({
    description: '接口路径，未传则保持原值',
    example: '/api/v1/user/profile',
  })
  path?: string;

  @ApiPropertyOptional({
    description: 'HTTP 方法，未传则保持原值',
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
  method?: string;

  @ApiPropertyOptional({
    description: '接口状态，未传则保持原值',
    enum: ['New', 'Debugged', 'To Test', 'Published'],
  })
  status?: string;

  @ApiPropertyOptional({
    description: '请求头配置 JSON',
  })
  requestHeaders?: any;

  @ApiPropertyOptional({
    description: '请求参数/Body 配置 JSON',
  })
  requestParams?: any;

  @ApiPropertyOptional({
    description: '响应头配置 JSON',
  })
  responseHeaders?: any;

  @ApiPropertyOptional({
    description: '响应结构 Schema JSON',
  })
  responseSchema?: any;

  @ApiPropertyOptional({
    description: '静态 Mock JSON 字符串',
  })
  mockStaticBody?: string;

  @ApiPropertyOptional({
    description: '动态脚本 Mock 内容',
  })
  mockScript?: string;

  @ApiPropertyOptional({
    description: 'Mock 模式：static | script | proxy',
  })
  mockMode?: string;

  @ApiPropertyOptional({
    description: '代理真实服务地址，仅 proxy 模式生效',
  })
  mockProxyUrl?: string;
}
