import { NestFactory, INestApplication } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedocModule, RedocOptions } from 'nestjs-redoc';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const clientUrl = configService.get('CLIENT_URL') || 'http://localhost:3000';
  app.enableCors({
    origin: clientUrl,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // ตั้งค่า WebSocket adapter
  class CustomIoAdapter extends IoAdapter {
    constructor(app: INestApplication) {
      super(app);
    }
  }
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Emergency Project API')
    .setDescription('API documentation for Emergency Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api`);
  console.log(`Redoc UI is available at: http://localhost:${port}/docs`);
  console.log(`CORS configured for: ${clientUrl}`);
}

bootstrap();