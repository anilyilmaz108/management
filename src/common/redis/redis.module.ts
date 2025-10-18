import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // Global yaparsan her modülde tekrar import etmene gerek kalmaz
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
