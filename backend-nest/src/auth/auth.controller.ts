import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import {
  AuthTokenResponseDto,
  CurrentUserResponseDto,
  SimpleSuccessResponseDto,
} from './dto/auth-response.dto';
import { ApiResponseEnvelope } from '../common/api-response';

@ApiTags('auth')
@ApiExtraModels(ApiResponseEnvelope, AuthTokenResponseDto, CurrentUserResponseDto, SimpleSuccessResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: '用户注册',
    description: '使用邮箱和密码注册新用户，可选填写用户名与公司名称。',
  })
  @ApiResponse({
    status: 201,
    description: '注册成功，返回基础用户信息与访问令牌。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(AuthTokenResponseDto) },
          },
        },
      ],
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: '用户登录',
    description: '通过邮箱和密码登录，成功后返回访问令牌和用户信息。',
  })
  @ApiResponse({
    status: 200,
    description: '登录成功，返回 JWT 等鉴权信息。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(AuthTokenResponseDto) },
          },
        },
      ],
    },
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({
    summary: '获取当前登录用户信息',
    description: '根据 Authorization Header 中的 Bearer Token 解析并返回当前用户信息。',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功，返回当前登录用户的基础资料。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(CurrentUserResponseDto) },
          },
        },
      ],
    },
  })
  async me(@Headers('authorization') authHeader?: string) {
    const token = this.extractToken(authHeader);
    return this.authService.getUserByToken(token);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({
    summary: '退出登录',
    description: '使当前访问令牌失效，客户端应删除本地缓存的 Token。',
  })
  @ApiResponse({
    status: 200,
    description: '退出成功。',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseEnvelope) },
        {
          properties: {
            data: { $ref: getSchemaPath(SimpleSuccessResponseDto) },
          },
        },
      ],
    },
  })
  async logout(@Headers('authorization') authHeader?: string) {
    const token = this.extractToken(authHeader);
    return this.authService.logout(token);
  }

  private extractToken(authHeader?: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing Authorization header');
    }
    return authHeader.substring('Bearer '.length);
  }
}

