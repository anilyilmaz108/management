import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_EXPIRES_IN, JWT_SECRET } from 'src/config/jwt.config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { ElkLogService } from 'src/logger/elk-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: JWT_SECRET,
        signOptions: { expiresIn: JWT_EXPIRES_IN },
      }),
    }),
    ConfigModule,
  ],
  providers: [AuthService, JwtAuthGuard, RolesGuard, WinstonLoggerService, ElkLogService],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
