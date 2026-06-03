import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssetDto {
  @ApiPropertyOptional({ example: 'Auth Endpoint' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://api.example.com/auth' })
  value?: string;

  @ApiPropertyOptional({ example: 'URL' })
  type?: string;

  @ApiPropertyOptional({ example: 'Infrastructure' })
  category?: string;
}
