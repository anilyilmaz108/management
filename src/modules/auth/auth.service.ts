import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RedisService } from 'src/common/redis/redis.service';
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({ ...createUserDto, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async login(email: string, password: string) {
    const ACCESS_TOKEN_TTL = this.configService.get<number>('cache.ACCESS_TOKEN_TTL');
    const REFRESH_TOKEN_TTL = this.configService.get<number>('cache.REFRESH_TOKEN_TTL');

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // Dinamik secret üret
    const accessSecret = randomBytes(64).toString('hex');
    const refreshSecret = randomBytes(64).toString('hex');

    // Redis’e kaydet
    await this.redisService.set(`jwtSecret:access:${user.id}`, accessSecret, ACCESS_TOKEN_TTL);
    await this.redisService.set(`jwtSecret:refresh:${user.id}`, refreshSecret, REFRESH_TOKEN_TTL);

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

    return { accessToken, refreshToken };
  }

  async refresh(userId: number, refreshToken: string) {
    const ACCESS_TOKEN_TTL = this.configService.get<number>('cache.ACCESS_TOKEN_TTL');
    const REFRESH_TOKEN_TTL = this.configService.get<number>('cache.REFRESH_TOKEN_TTL');

    const refreshSecret = await this.redisService.get(`jwtSecret:refresh:${userId}`);
    if (!refreshSecret) throw new UnauthorizedException('Refresh token expired');

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, { secret: refreshSecret });

      // Yeni access token üret
      const accessSecret = randomBytes(64).toString('hex');
      await this.redisService.set(`jwtSecret:access:${userId}`, accessSecret, ACCESS_TOKEN_TTL);

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
