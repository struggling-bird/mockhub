import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectMemberDto {
  @ApiPropertyOptional({
    description: '项目角色',
    enum: ['Admin', 'Editor', 'Viewer'],
    example: 'Viewer',
  })
  role?: string;

  @ApiPropertyOptional({
    description: '成员状态',
    enum: ['Active', 'Inactive'],
    example: 'Active',
  })
  status?: string;
}
