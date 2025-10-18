import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';

// docker-compose -f docker-compose.yml up -d
// docker-compose up -d postgres redis


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('doc', app, doc);
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
