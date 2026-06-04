import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectRoleDto {
  @ApiProperty({ required: false, description: '角色名称', example: 'QA Engineer' })
  name?: string;

  @ApiProperty({ required: false, description: '角色描述', example: 'Can validate APIs and assets.' })
  description?: string;

  @ApiProperty({
    required: false,
    description: '角色权限 key 列表',
    example: ['project.view', 'api.view', 'api.proxy'],
  })
  permissions?: string[];
}
