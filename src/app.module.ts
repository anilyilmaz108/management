import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './common/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './modules/user/entity/user.entity';
import { Post } from './modules/post/entity/post.entity';
import { Comment } from './modules/comment/entity/comment.entity';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { DatabaseConfigService } from './config/database.config';
import cacheConfig from './config/cache.config';
import corsConfig from './config/cors.config';

@Module({
  imports: [
  ConfigModule.forRoot({
      isGlobal: true,
      load: [corsConfig, cacheConfig], // cache config buradan global erişilebilir
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    RedisModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
