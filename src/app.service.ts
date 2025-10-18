import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    const port = this.configService.get<number>('PORT');
    const env = this.configService.get<string>('NODE_ENV');
    return `Running on port ${port} in ${env} mode`;
  }
}
