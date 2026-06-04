import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectRoleDto {
  @ApiProperty({ description: '角色名称', example: 'QA Engineer' })
  name: string;

  @ApiProperty({ required: false, description: '角色描述', example: 'Can validate APIs and assets.' })
  description?: string;

  @ApiProperty({ required: false, description: '复制权限来源角色 key', example: 'Editor' })
  copyFromRoleKey?: string;
}
