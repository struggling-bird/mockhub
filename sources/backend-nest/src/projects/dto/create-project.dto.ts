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

  @ApiProperty({
    required: false,
    description:
      '是否允许在真实代理模式下自动学习并更新接口配置（请求头/参数结构/响应头/响应结构/静态 Mock），true 表示开启',
    example: true,
  })
  autoCapture?: boolean;

  @ApiProperty({
    required: false,
    description:
      'Set-Cookie 的 Domain 重写策略：off-不处理，origin-重写为当前访问域名，custom-重写为自定义域名',
    enum: ['off', 'origin', 'custom'],
    example: 'origin',
  })
  cookieRewriteMode?: string;

  @ApiProperty({
    required: false,
    description: '当 cookieRewriteMode=custom 时，重写 Domain 的目标域名',
    example: 'localhost',
  })
  cookieRewriteDomain?: string;
}

