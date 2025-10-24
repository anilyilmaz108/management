import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from './logger/winston-logger.service';

// docker-compose -f docker-compose.yml up -d
// docker-compose up -d postgres redis

// Eğer aynı porta bağlanmakta hata oluyorsa
// docker ps
// docker stop <container_id>

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const corsConfig = configService.get('cors');

  app.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    credentials: corsConfig.credentials,
  });

  app.useLogger(app.get(WinstonLoggerService));

  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('doc', app, doc);
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
