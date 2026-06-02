import { ApiProperty } from '@nestjs/swagger';

export class ProjectSummaryDto {
  @ApiProperty({
    description: '项目唯一 ID',
    example: 'proj_123456',
  })
  id: string;

  @ApiProperty({
    description: '项目名称',
    example: '用户中心服务',
  })
  name: string;

  @ApiProperty({
    description: '项目描述',
    example: '负责用户注册、登录、资料维护等基础能力',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: '项目创建时间（ISO 字符串）',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '项目 Logo 地址，如未设置则为 null',
    example: '/api/upload/logos/logo_1713778899_xxxxx.webp',
    required: false,
  })
  logoUrl?: string | null;

  @ApiProperty({
    description: '项目级默认代理地址，通常用于真实服务代理模式的上游服务 baseURL',
    example: 'https://api.example.com',
    required: false,
  })
  proxyUrl?: string | null;

  @ApiProperty({
    description: '项目唯一 Mock 密钥，用于通过 Header x-mock-key 标识项目',
    example: 'mk_live_1a2b3c4d',
  })
  mockKey: string;

  @ApiProperty({
    description:
      'Set-Cookie 的 Domain 重写策略：off-不处理，origin-重写为当前访问域名，custom-重写为自定义域名',
    enum: ['off', 'origin', 'custom'],
    example: 'origin',
    required: false,
  })
  cookieRewriteMode?: string;

  @ApiProperty({
    description: '当 cookieRewriteMode=custom 时，重写 Domain 的目标域名',
    example: 'localhost',
    required: false,
  })
  cookieRewriteDomain?: string | null;

  @ApiProperty({
    description: '是否开启代理自动学习更新',
    example: true,
    required: false,
  })
  autoCapture?: boolean;
}

export class ProjectDetailDto {
  @ApiProperty({
    description: '项目唯一 ID',
    example: 'proj_123456',
  })
  id: string;

  @ApiProperty({
    description: '项目名称',
    example: '用户中心服务',
  })
  name: string;

  @ApiProperty({
    description: '项目描述',
    example: '负责用户注册、登录、资料维护等基础能力',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: '项目 Logo 地址，如未设置则为 null',
    example: '/api/upload/logos/logo_1713778899_xxxxx.webp',
    required: false,
  })
  logoUrl?: string | null;

  @ApiProperty({
    description: '项目唯一 Mock 密钥，用于通过 Header x-mock-key 标识项目',
    example: 'mk_live_1a2b3c4d',
  })
  mockKey: string;

  @ApiProperty({
    description: '项目级默认代理策略：static（静态 Mock）、script（脚本 Mock）、proxy（真实服务代理）',
    enum: ['static', 'script', 'proxy'],
    example: 'static',
    required: false,
  })
  defaultMockMode?: string;

  @ApiProperty({
    description:
      '是否允许在真实代理模式下自动学习并更新接口配置（请求头/参数结构/响应头/响应结构/静态 Mock），true 表示开启',
    example: true,
    required: false,
  })
  autoCapture?: boolean;

  @ApiProperty({
    description:
      'Set-Cookie 的 Domain 重写策略：off-不处理，origin-重写为当前访问域名，custom-重写为自定义域名',
    enum: ['off', 'origin', 'custom'],
    example: 'origin',
    required: false,
  })
  cookieRewriteMode?: string;

  @ApiProperty({
    description: '当 cookieRewriteMode=custom 时，重写 Domain 的目标域名',
    example: 'localhost',
    required: false,
  })
  cookieRewriteDomain?: string | null;
}

