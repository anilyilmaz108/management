import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from './logger/winston-logger.service';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { ErrorMaskingInterceptor } from './common/interceptor/error-masking.interceptor';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { AllExceptionsFilter } from './common/filter/exception.filter';
import { getQueueToken } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
// docker-compose -f docker-compose.yml up -d
// docker-compose up -d postgres redis

// Eğer aynı porta bağlanmakta hata oluyorsa
// docker ps
// docker stop <container_id>

// Docker konteynerlerini durdurmak için
// docker-compose down
// Docker koonteynarları build için
// docker-compose up --build

// http://localhost:9200/_cat/indices?v
// Buradan indexleri görebiliriz

// http://localhost:9200
// Elasticsearch'e bağlanmak için

// http://localhost:5601
// Kibana arayüzüne bağlanmak için
// Arayüze bağlandığında adımlar
// Stack Management -> Data Views -> Create data view
// Discover kısmından logları görebiliriz
// Ayrıca index management kısmından indexleri yönetebiliriz
// 1- Stack Management > Index Management > Create index pattern
// 2- index pattern ismi olarak logstash-* yazıp next step
// 3- Time Filter field name olarak @timestamp seçilip create index pattern

// Cloud Storage kullanımı + Multer
// Multer ile dosya yükleme ve Cloud storage için frontendde işlemleri yapıp
// En son Url sini backende atabiliriz.
// İhtiyaç durumunda backendde de multer ile dosya yükleme işlemi yapılabilir.

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const corsConfig = configService.get('cors');

  app.enableCors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'null', '*'], // local test için
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  /**  app.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    credentials: corsConfig.credentials,
  }); */

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ErrorMaskingInterceptor(),
    new TransformInterceptor(),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useLogger(app.get(WinstonLoggerService));

  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('doc', app, doc);

  const emailQueue: Queue = app.get(getQueueToken('email'));
  const smsQueue: Queue = app.get(getQueueToken('sms'));

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [new BullAdapter(emailQueue), new BullAdapter(smsQueue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
