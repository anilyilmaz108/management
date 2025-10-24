import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RedisService } from 'src/common/redis/redis.service';
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import { ElkLogService, LOGLEVELS } from 'src/logger/elk-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
    private readonly logger: WinstonLoggerService,
    private readonly elkLogger: ElkLogService,
  ) {}

  async register(createUserDto: any) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      // Log info
      this.logger.log(
        `Registering user with email: ${createUserDto.email}`,
        'AuthService',
      );

      return this.userRepository.save(user);
    } catch (error) {
      // Log error
      this.logger.error(
        `Register failed for ${createUserDto.email}: ${error.message}`,
        'AuthService',
      );
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const ACCESS_TOKEN_TTL = this.configService.get<number>(
        'cache.ACCESS_TOKEN_TTL',
      );
      const REFRESH_TOKEN_TTL = this.configService.get<number>(
        'cache.REFRESH_TOKEN_TTL',
      );

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(
          `Login failed: User not found (${email})`,
          'AuthService',
        );
        throw new UnauthorizedException('User not found');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        this.logger.warn(
          `Login failed: Invalid credentials (${email})`,
          'AuthService',
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Dinamik secret üret
      const accessSecret = randomBytes(64).toString('hex');
      const refreshSecret = randomBytes(64).toString('hex');

      // Redis’e kaydet
      await this.redisService.set(
        `jwtSecret:access:${user.id}`,
        accessSecret,
        ACCESS_TOKEN_TTL,
      );
      await this.redisService.set(
        `jwtSecret:refresh:${user.id}`,
        refreshSecret,
        REFRESH_TOKEN_TTL,
      );

      const payload = { sub: user.id, email: user.email, role: user.role };

      // Token üret
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: ACCESS_TOKEN_TTL,
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: REFRESH_TOKEN_TTL,
      });

      // Log successful login
      // winston logger -> file içine yazar
      this.logger.log(`User logged in: ${email}`, 'AuthService');
      // ELK logger -> logstash'e yazar
      this.elkLogger.log(
        `User logged in: ${email}`,
        AuthService.name,
        LOGLEVELS.INFO,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        `Login error for ${email}: ${error.message}`,
        'AuthService',
      );
      this.elkLogger.log(
        `Login error for ${email}: ${error.message}`,
        AuthService.name,
        LOGLEVELS.ERROR,
      );
      throw error;
    }
  }

  async refresh(userId: number, refreshToken: string) {
    const ACCESS_TOKEN_TTL = this.configService.get<number>(
      'cache.ACCESS_TOKEN_TTL',
    );
    const REFRESH_TOKEN_TTL = this.configService.get<number>(
      'cache.REFRESH_TOKEN_TTL',
    );

    const refreshSecret = await this.redisService.get(
      `jwtSecret:refresh:${userId}`,
    );
    if (!refreshSecret)
      throw new UnauthorizedException('Refresh token expired');

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });

      // Yeni access token üret
      const accessSecret = randomBytes(64).toString('hex');
      await this.redisService.set(
        `jwtSecret:access:${userId}`,
        accessSecret,
        ACCESS_TOKEN_TTL,
      );

      const newAccessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, role: payload.role },
        { secret: accessSecret, expiresIn: ACCESS_TOKEN_TTL },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.redisService.del(`jwtSecret:access:${userId}`);
    await this.redisService.del(`jwtSecret:refresh:${userId}`);
    return { message: 'Logged out successfully' };
  }
}
