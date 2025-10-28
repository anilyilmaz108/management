import { QueueModule } from './queues/queue.module';
import { SmsModule } from './queues/sms/sms.module';
import { AdminModule } from './modules/admin/admin.module';
import { MailModule } from './queues/mail/mail.module';
import { RedisCleanupService } from './schedule/redis-cleanup.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filter/exception.filter';
import { ElkLogService } from './logger/elk-log.service';
import { WinstonLoggerService } from './logger/winston-logger.service';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { CorrelationIdMiddleware } from './common/middleware/corelation-id.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisCleanerScheduleModule } from './schedule/redis-cleaner-schedule.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    QueueModule,
    SmsModule,
    AdminModule,
    MailModule,
    RedisCleanerScheduleModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [corsConfig, cacheConfig], // cache config buradan global erişilebilir
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
    ScheduleModule.forRoot({}),
    AuthModule,
    RedisModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    RedisCleanupService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    ElkLogService,
    WinstonLoggerService,
    AppService,
  ],
  exports: [WinstonLoggerService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
