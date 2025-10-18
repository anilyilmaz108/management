import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// docker-compose -f docker-compose.yml up -d
// docker-compose up -d postgres redis


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
