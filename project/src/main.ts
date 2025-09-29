import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';
import redoc = require('redoc-express');
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // HTTP CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // WebSocket setup
  app.useWebSocketAdapter(
    new IoAdapter(app)
  );

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Emergency Response System')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  writeFileSync(join(__dirname, '..', 'swagger.json'), JSON.stringify(swaggerDocument, null, 2));

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  expressInstance.get('/api/redoc', redoc({
    title: 'API Docs',
    specUrl: '/api/docs-json',
  }));
  expressInstance.get('/api/docs-json', (req, res) => res.json(swaggerDocument));

  // Start server
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
  console.log(`Redoc UI: http://localhost:${port}/api/redoc`);
}
bootstrap();