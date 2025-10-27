// src/schedule/redis-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class RedisCleanupService {
  private readonly logger = new Logger(RedisCleanupService.name);

  constructor(private readonly redisService: RedisService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Her gece 00:00
  // @Cron('* * * * *', {
  // name: 'aaa'
  // })
  async handleRedisCleanup() {
    this.logger.log('Redis cleanup task running');
    await this.redisService.flushAll();
    this.logger.log('Redis cache successfully cleared');
  }
}
