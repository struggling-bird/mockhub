import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiProxyRequestDto {
  @ApiProperty({
    description: '真实请求的目标地址，支持完整 URL',
    example: 'https://api.example.com/user/profile',
  })
  url: string;

  @ApiProperty({
    description: '真实请求的 HTTP 方法',
    example: 'GET',
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  })
  method: string;

  @ApiPropertyOptional({
    description: '真实请求头键值对',
    example: {
      Authorization: 'Bearer token-demo',
      'Content-Type': 'application/json',
    },
  })
  headers?: Record<string, string>;

  @ApiPropertyOptional({
    description: '查询参数键值对，后端会自动拼接到 URL 上',
    example: {
      page: '1',
      keyword: 'mockhub',
    },
  })
  query?: Record<string, string>;

  @ApiPropertyOptional({
    description: '真实请求体内容，通常为 JSON 字符串',
    example: '{\n  "id": "user_1"\n}',
  })
  body?: string;
}

export class ApiProxyResponseHeaderDto {
  @ApiProperty({
    description: '响应头名称',
    example: 'content-type',
  })
  key: string;

  @ApiProperty({
    description: '响应头取值',
    example: 'application/json; charset=utf-8',
  })
  value: string;
}

export class ApiProxyResponseDto {
  @ApiProperty({
    description: '真实响应状态码',
    example: 200,
  })
  status: number;

  @ApiProperty({
    description: '真实响应状态文本',
    example: 'OK',
  })
  statusText: string;

  @ApiProperty({
    description: '真实响应头列表',
    type: [ApiProxyResponseHeaderDto],
  })
  headers: ApiProxyResponseHeaderDto[];

  @ApiProperty({
    description: '真实响应体原始文本',
    example: '{\n  "code": 0,\n  "message": "ok"\n}',
  })
  body: string;

  @ApiPropertyOptional({
    description: '响应体内容类型',
    example: 'application/json; charset=utf-8',
  })
  contentType?: string | null;
}
