import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as swaggerUi from 'swagger-ui-express';
import redoc = require('redoc-express'); // TS declaration จะบอกว่า any
import { writeFileSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors();

  // ------------------------------
  // สร้าง Swagger Document และเซฟเป็นไฟล์ JSON อัตโนมัติ
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Emergency Response System')
    .setDescription('API description')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  writeFileSync(join(__dirname, '..', 'swagger.json'), JSON.stringify(swaggerDocument, null, 2));
  // ------------------------------

  // Swagger UI
  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Redoc
  expressInstance.get('/api/redoc', redoc({
    title: 'API Docs',
    specUrl: '/api/docs-json',
  }));
  expressInstance.get('/api/docs-json', (req, res) => res.json(swaggerDocument));

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
  console.log(`Redoc UI: http://localhost:${port}/api/redoc`);
}
bootstrap();
