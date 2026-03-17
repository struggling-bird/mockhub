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
}

