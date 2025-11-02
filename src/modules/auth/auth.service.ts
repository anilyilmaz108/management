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
import { RedisKeys } from 'src/common/redis/redis-keys.helper';
import { JWT_SECRET } from 'src/config/jwt.config';

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

      this.logger.log(
        `Registering user with email: ${createUserDto.email}`,
        AuthService.name,
      );

      return this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        `Register failed for ${createUserDto.email}: ${error.message}`,
        AuthService.name,
      );
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const ACCESS_TOKEN_TTL = this.configService.get<number>('cache.ACCESS_TOKEN_TTL');
      const REFRESH_TOKEN_TTL = this.configService.get<number>('cache.REFRESH_TOKEN_TTL');

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(`Login failed: User not found (${email})`, AuthService.name);
        throw new UnauthorizedException('User not found');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        this.logger.warn(`Login failed: Invalid credentials (${email})`, AuthService.name);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Dinamik secret üret
      const accessSecret = JWT_SECRET; //randomBytes(64).toString('hex');
      const refreshSecret = randomBytes(64).toString('hex');

      // Redis key’leri merkezi yerden al
      const accessKey = RedisKeys.jwt.access(user.id);
      const refreshKey = RedisKeys.jwt.refresh(user.id);

      // Redis’e kaydet
      await this.redisService.set(accessKey, accessSecret, ACCESS_TOKEN_TTL);
      await this.redisService.set(refreshKey, refreshSecret, REFRESH_TOKEN_TTL);

      const payload = { sub: user.id, email: user.email, role: user.role };

      // Token üret
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: JWT_SECRET,
        expiresIn: ACCESS_TOKEN_TTL,
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: REFRESH_TOKEN_TTL,
      });

      // Loglama
      this.logger.log(`User logged in: ${email}`, AuthService.name);
      this.elkLogger.log(`User logged in: ${email}`, AuthService.name, LOGLEVELS.INFO);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(`Login error for ${email}: ${error.message}`, AuthService.name);
      this.elkLogger.log(`Login error for ${email}: ${error.message}`, AuthService.name, LOGLEVELS.ERROR);
      throw error;
    }
  }

  async refresh(userId: number, refreshToken: string) {
    const ACCESS_TOKEN_TTL = this.configService.get<number>('cache.ACCESS_TOKEN_TTL');
    const REFRESH_TOKEN_TTL = this.configService.get<number>('cache.REFRESH_TOKEN_TTL');

    const refreshKey = RedisKeys.jwt.refresh(userId);
    const refreshSecret = await this.redisService.get(refreshKey);
    if (!refreshSecret) throw new UnauthorizedException('Refresh token expired');

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, { secret: refreshSecret });

      // Yeni access token üret
      const accessSecret = randomBytes(64).toString('hex');
      const accessKey = RedisKeys.jwt.access(userId);

      await this.redisService.set(accessKey, accessSecret, ACCESS_TOKEN_TTL);

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
    const accessKey = RedisKeys.jwt.access(userId);
    const refreshKey = RedisKeys.jwt.refresh(userId);

    await this.redisService.del(accessKey);
    await this.redisService.del(refreshKey);

    return { message: 'Logged out successfully' };
  }
}
