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
}

