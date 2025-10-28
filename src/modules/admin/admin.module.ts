import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from 'src/modules/user/entity/user.entity';
import { RedisService } from 'src/common/redis/redis.service';
import { MailModule } from 'src/queues/mail/mail.module';
import { SmsModule } from 'src/queues/sms/sms.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_EXPIRES_IN, JWT_SECRET } from 'src/config/jwt.config';
import { QueueManagerService } from 'src/queues/queue-manager/queue-manager.service';
import { QueueModule } from 'src/queues/queue.module';
import { QueueManagerModule } from 'src/queues/queue-manager/queue-manager.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
    SmsModule,
    QueueModule,
    QueueManagerModule,
    JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: JWT_SECRET,
            signOptions: { expiresIn: JWT_EXPIRES_IN },
          }),
        }),
  ],
  controllers: [AdminController],
  providers: [AdminService, RedisService, JwtAuthGuard, RolesGuard],
})
export class AdminModule {}
