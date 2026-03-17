import * as crypto from 'crypto';

const SALT_LENGTH = 16;
const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = crypto
    .pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex');
  return `${salt}:${ITERATIONS}:${derivedKey}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  // 兼容历史明文密码：老数据中存的就是原始密码
  if (!hashed || hashed.split(':').length !== 3) {
    return password === hashed;
  }

  try {
    const [salt, iterationsStr, key] = hashed.split(':');
    const iterations = Number(iterationsStr) || ITERATIONS;
    const derivedKey = crypto
      .pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST)
      .toString('hex');
    return crypto.timingSafeEqual(
      Buffer.from(key, 'hex'),
      Buffer.from(derivedKey, 'hex'),
    );
  } catch {
    // 出现解析/计算异常时，保守返回 false，避免抛出运行时错误
    return false;
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateId(prefix = 'u'): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

