import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '登录邮箱，用于唯一标识用户',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '登录密码，前端需加强校验与传输安全',
    example: 'P@ssw0rd!',
  })
  password: string;

  @ApiProperty({
    required: false,
    description: '用户昵称，用于展示而非登录标识',
    example: '王小明',
  })
  username?: string;

  @ApiProperty({
    required: false,
    description: '公司或团队名称，便于区分企业空间',
    example: 'MockHub 科技有限公司',
  })
  company?: string;

  @ApiProperty({
    required: false,
    description: '项目邀请 token，注册成功后自动接受邀请并加入项目',
    example: 'inv_abc123',
  })
  inviteToken?: string;
}
