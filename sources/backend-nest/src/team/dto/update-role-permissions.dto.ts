import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    description: '按角色提交权限 key 列表，Owner 固定全权限不可修改',
    example: {
      Admin: ['project.view', 'project.update', 'team.view'],
      Editor: ['project.view', 'api.view', 'api.update'],
      Viewer: ['project.view', 'api.view'],
    },
  })
  permissions: Record<string, string[]>;
}
