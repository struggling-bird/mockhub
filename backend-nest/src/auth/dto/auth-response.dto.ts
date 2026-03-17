import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({
    description: '用户唯一 ID',
    example: 'u_123456',
  })
  id: string;

  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '账号创建时间（ISO 字符串）',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  createdAt?: string;
}

export class AuthTokenResponseDto {
  @ApiProperty({
    description: '访问令牌，用于后续接口的 Bearer 鉴权',
    example: 'tk_2b9d0e4c1f6a4e3d8f1c2b9d0e4c1f6',
  })
  token: string;

  @ApiProperty({
    description: '登录或注册成功后的基础用户信息',
    type: AuthUserDto,
  })
  user: AuthUserDto;
}

export class CurrentUserResponseDto extends AuthUserDto {}

export class SimpleSuccessResponseDto {
  @ApiProperty({
    description: '表示操作是否成功',
    example: true,
  })
  success: boolean;
}

