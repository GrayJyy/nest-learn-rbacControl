import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  async listGet(key: string) {
    return await this.redisClient.lRange(key, 0, -1);
  }

  async listSet(key: string, value: string[], ttl?: number) {
    value.forEach(async (i) => await this.redisClient.lPush(key, i));
    ttl && (await this.redisClient.expire(key, ttl));
  }
}
