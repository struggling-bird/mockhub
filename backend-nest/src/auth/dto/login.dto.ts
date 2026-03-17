import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '登录邮箱，需与注册时保持一致',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '登录密码，明文仅在传输中存在，服务端存储为哈希',
    example: 'P@ssw0rd!',
  })
  password: string;
}

