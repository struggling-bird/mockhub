import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseEnvelope<T = any> {
  @ApiProperty({
    description: '业务状态码，"0" 表示成功，其它为错误码（如 AUTH_401）',
    example: '0',
  })
  code!: string;

  @ApiProperty({
    description: '人类可读的中文提示信息',
    example: '操作成功',
  })
  message!: string;

  @ApiProperty({
    description: '具体业务数据，失败时通常为 null',
  })
  data!: T | null;

  @ApiProperty({
    description: '可选的链路追踪 ID，用于排查问题',
    example: 'trace-9f8c7b6a5d4e3f2a',
    required: false,
  })
  traceId?: string;
}

export function ok<T>(data: T, message = '操作成功'): ApiResponseEnvelope<T> {
  return {
    code: '0',
    message,
    data,
  };
}

