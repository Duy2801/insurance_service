import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app: INestApplication = await NestFactory.create(AppModule);

  // Bật CORS cho phép các ứng dụng Frontend kết nối
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Cấu hình Swagger OpenAPI UI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Hệ Thống Tích Hợp Bảo Hiểm MIC')
    .setDescription('Tài liệu API tích hợp cổng bảo hiểm MIC (Xác thực, Tính phí, Cấp đơn TNDS Xe máy)')
    .setVersion('1.0')
    .addTag('MIC Authentication (Xác thực MIC)', 'Quản lý Access Token và xác thực với core MIC')
    .addTag('Bảo hiểm TNDS Xe máy', 'Các API tính phí, validate và phát hành GCN xe máy')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app as any, swaggerConfig);
  SwaggerModule.setup('api', app as any, document, {
    customSiteTitle: 'MIC Insurance API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Server đang chạy tại: http://localhost:${port}`);
  logger.log(`Swagger Docs khả dụng tại: http://localhost:${port}/api`);
}
await bootstrap();
