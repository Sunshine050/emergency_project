import { NestFactory, INestApplication } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedocModule, RedocOptions } from 'nestjs-redoc';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule); // ระบุ type ชัดเจน
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  const configService = app.get(ConfigService);

  // Configure global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // ตั้งค่า Swagger
  const config = new DocumentBuilder()
    .setTitle('Emergency Project API')
    .setDescription('API documentation for Emergency Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ตั้งค่า Redoc
  const redocOptions: RedocOptions = {
    title: 'Emergency Project API',
    logo: {
      url: 'https://example.com/logo.png',
    },
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false,
  };
  await RedocModule.setup('docs', app, document, redocOptions);

  // Get port from environment variables
  const port = configService.get('PORT') || 3000;

  // เรียก listen ก่อน
  await app.listen(port);

  // ตั้งค่า WebSocket adapter หลัง listen
  app.useWebSocketAdapter(new IoAdapter(app));

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api`);
  console.log(`Redoc UI is available at: http://localhost:${port}/docs`);
}

bootstrap();