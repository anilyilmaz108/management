import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisService } from 'src/common/redis/redis.service';
import { RedisCleanupService } from './redis-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [RedisCleanupService, RedisService],
})
export class RedisCleanerScheduleModule {}