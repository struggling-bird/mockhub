import { ApiProperty } from '@nestjs/swagger';

export class UpdateProxyGroupDto {
  @ApiProperty({ required: false, description: '代理分组名称', example: 'User APIs' })
  name?: string;

  @ApiProperty({ required: false, description: '路径正则表达式', example: '^/api/users' })
  regex?: string;

  @ApiProperty({ required: false, description: '代理模式：Mock | Proxy | Hybrid', example: 'Hybrid' })
  mode?: string;

  @ApiProperty({ required: false, description: '命中分组后的代理目标地址', example: 'https://api.example.com' })
  targetUrl?: string | null;

  @ApiProperty({ required: false, description: '匹配优先级，数字越小越优先', example: 10 })
  priority?: number;

  @ApiProperty({ required: false, description: '是否启用', example: true })
  enabled?: boolean;

  @ApiProperty({ required: false, description: '是否自动捕获学习接口', example: true })
  autoCapture?: boolean;
}
