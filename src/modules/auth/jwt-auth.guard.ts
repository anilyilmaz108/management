import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('Authorization header missing');

    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) throw new UnauthorizedException('Invalid token');

    try {
      // Önce token'ı decode et (verify etmeden payload'ı oku)
      const decoded = this.jwtService.decode(token) as any;
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token structure');
      }

      const userId = decoded.sub;

      // Redis'ten bu kullanıcının access secret'ını al
      const accessSecret = await this.redisService.get(`jwtSecret:access:${userId}`);
      
      if (!accessSecret) {
        throw new UnauthorizedException('Token expired or revoked');
      }

      // Artık doğru secret ile verify edebiliriz
      const payload = await this.jwtService.verifyAsync(token, {
        secret: accessSecret
      });

      request['user'] = payload;
      // console.log('Payload set to request:', payload); 
      return true;
    } catch (err) {
      console.log('JWT verification error:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}