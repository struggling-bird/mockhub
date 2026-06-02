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

  @ApiPropertyOptional({
    description: '是否开启代理自动学习更新，未传则保持原值',
    example: true,
  })
  autoCapture?: boolean;

  @ApiPropertyOptional({
    description:
      'Set-Cookie 的 Domain 重写策略：off-不处理，origin-重写为当前访问域名，custom-重写为自定义域名，未传则保持原值',
    enum: ['off', 'origin', 'custom'],
    example: 'origin',
  })
  cookieRewriteMode?: string;

  @ApiPropertyOptional({
    description: '当 cookieRewriteMode=custom 时，重写 Domain 的目标域名，未传则保持原值',
    example: 'localhost',
  })
  cookieRewriteDomain?: string | null;
}

