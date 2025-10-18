import { DocumentBuilder } from "@nestjs/swagger";

 export const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .setContact('API Support', 'http://www.example.com/support', 'anilyilmaz108@gmail.com')
    .setTermsOfService('http://example.com/terms/')
    .addTag('api')
    .build();