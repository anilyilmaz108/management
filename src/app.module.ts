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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // tüm uygulamada kullanılabilir hale getirir
      envFilePath: ['.env'], // farklı env dosyaları da tanımlayabilirsin (örn: .env.dev, .env.prod)
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [User, Post, Comment],
      autoLoadEntities: true,
      synchronize: true, // dev için
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
