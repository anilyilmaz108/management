import { ElkLogService } from './logger/elk-log.service';
import { WinstonLoggerService } from './logger/winston-logger.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './common/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { DatabaseConfigService } from './config/database.config';
import cacheConfig from './config/cache.config';
import corsConfig from './config/cors.config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [corsConfig, cacheConfig], // cache config buradan global erişilebilir
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    AuthModule,
    RedisModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [ElkLogService, WinstonLoggerService, AppService],
  exports: [WinstonLoggerService],
})
export class AppModule {}
