import { ApiProperty } from '@nestjs/swagger';

export class AddProjectMemberDto {
  @ApiProperty({
    description: '被邀请用户邮箱，可以是尚未注册的合法邮箱',
    example: 'teammate@example.com',
  })
  email: string;

  @ApiProperty({
    description: '项目角色',
    enum: ['Admin', 'Editor', 'Viewer'],
    example: 'Editor',
  })
  role: string;
}
