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
}

