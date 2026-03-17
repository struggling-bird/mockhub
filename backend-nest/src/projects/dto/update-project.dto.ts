import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: '项目名称，未传则保持原值',
    example: '用户中心服务（重构版）',
  })
  name?: string;

  @ApiPropertyOptional({
    description: '项目描述，未传则保持原值',
    example: '补充用户多租户支持后的描述信息',
  })
  description?: string;

  @ApiPropertyOptional({
    description: '项目 Logo 地址；传 null 可清空原有 Logo',
    example: '/api/upload/logos/logo_1713778899_xxxxx.webp',
  })
  logoUrl?: string | null;

  @ApiPropertyOptional({
    description: '项目级默认代理地址，未传则保持原值；传空字符串可清空原有配置',
    example: 'https://api.example.com',
  })
  proxyUrl?: string | null;

  @ApiPropertyOptional({
    description: '默认代理策略：static（静态 Mock）、script（脚本 Mock）、proxy（真实服务代理），未传则保持原值',
    enum: ['static', 'script', 'proxy'],
    example: 'static',
  })
  defaultMockMode?: string;
}

