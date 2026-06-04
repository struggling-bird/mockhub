import { ApiProperty } from '@nestjs/swagger';

export class AcceptProjectInvitationDto {
  @ApiProperty({
    description: '邀请 token',
    example: 'inv_abc123',
  })
  token: string;
}
