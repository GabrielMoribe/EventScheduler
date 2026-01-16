import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class TokenBlacklistService {
  private readonly PREFIX = 'blacklist:';

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: RedisClientType,
  ) {}

  async addToBlacklist(token: string, expiresInSeconds: number): Promise<void> {
    await this.redis.setEx(`${this.PREFIX}${token}`, expiresInSeconds, 'true');
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(`${this.PREFIX}${token}`);
    return result !== null;
  }
}