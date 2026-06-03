import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ example: 'Auth Endpoint' })
  name: string;

  @ApiProperty({ example: 'https://api.example.com/auth' })
  value: string;

  @ApiProperty({ example: 'URL' })
  type: string;

  @ApiProperty({ example: 'Infrastructure' })
  category: string;
}
