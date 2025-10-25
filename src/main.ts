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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const corsConfig = configService.get('cors');

  app.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    credentials: corsConfig.credentials,
  });

  app.useGlobalInterceptors(
  new LoggingInterceptor(),
  new ErrorMaskingInterceptor(),
  new TransformInterceptor(),
);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useLogger(app.get(WinstonLoggerService));

  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('doc', app, doc);
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
