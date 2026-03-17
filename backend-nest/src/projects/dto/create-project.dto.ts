import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: '项目名称，需在当前用户下唯一且可读性强',
    example: '用户中心服务',
  })
  name: string;

  @ApiProperty({
    required: false,
    description: '项目描述，简要说明服务用途和边界',
    example: '负责用户注册、登录、资料维护等基础能力',
  })
  description?: string;

  @ApiProperty({
    required: false,
    description: '项目 Logo 地址，通常为上传接口返回的 URL',
    example: '/api/upload/logos/logo_1713778899_xxxxx.webp',
  })
  logoUrl?: string;

  @ApiProperty({
    required: false,
    description: '项目级默认代理地址，通常配置为真实服务的基础域名，例如 https://api.example.com',
    example: 'https://api.example.com',
  })
  proxyUrl?: string;

  @ApiProperty({
    required: false,
    description: '默认代理策略：static（静态 Mock）、script（脚本 Mock）、proxy（真实服务代理）',
    enum: ['static', 'script', 'proxy'],
    example: 'static',
  })
  defaultMockMode?: string;
}

