import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  hashPassword,
  verifyPassword,
  generateId,
  generateToken,
} from './auth.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ok } from '../common/api-response';

@Injectable()
export class AuthService {
  private readonly tokenPrefix = 'auth:token:';
  private readonly tokenTtlSeconds = Number(
    process.env.AUTH_TOKEN_TTL_SECONDS ?? '604800',
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private getTokenKey(token: string) {
    return `${this.tokenPrefix}${token}`;
  }

  private async persistToken(token: string, userId: string) {
    await this.redis.set(this.getTokenKey(token), userId, this.tokenTtlSeconds);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = hashPassword(dto.password);
    const token = generateToken();
    const user = await this.prisma.user.create({
      data: {
        id: generateId('u'),
        email: dto.email,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    await this.persistToken(token, user.id);
    return ok(
      {
        token,
        user,
      },
      '注册成功',
    );
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
    if (!user || !verifyPassword(dto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = generateToken();
    await this.persistToken(token, user.id);

    return ok(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      '登录成功',
    );
  }

  async getUserByToken(token: string) {
    const userId = await this.redis.get(this.getTokenKey(token));
    if (!userId) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.redis.expire(this.getTokenKey(token), this.tokenTtlSeconds);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return ok(user, '获取当前用户信息成功');
  }

  async logout(token: string) {
    await this.redis.del(this.getTokenKey(token));
    return ok({ success: true }, '退出登录成功');
  }
}

