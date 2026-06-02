import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '健康检查 / 根路由',
    description:
      '用于本地快速验证服务是否启动成功，可返回一段简单的欢迎文案。',
  })
  @ApiResponse({
    status: 200,
    description: '服务已启动，返回固定字符串。',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
