import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static assets (including swagger.json) from the "public" folder
  // Files placed in project/public will be reachable at /static/*
  // Example: http://localhost:3001/static/swagger.json
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

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

  // WebSocket adapter
  class CustomIoAdapter extends IoAdapter {
    constructor(app: NestExpressApplication) {
      super(app);
    }
  }
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Emergency Project API')
    .setDescription(`
      ## Emergency Response Management System API
      
      This API provides comprehensive endpoints for managing emergency requests, hospitals, rescue teams, and related services.
      
      ### Features:
      - **Authentication**: OAuth 2.0 (Google, Facebook, Apple) and Email/Password
      - **Emergency Requests**: Create and manage SOS emergency requests
      - **Hospital Management**: Hospital capacity, emergency acceptance
      - **Rescue Teams**: Team management and assignment
      - **Dashboard**: Real-time statistics and monitoring
      - **Notifications**: Real-time push notifications
      - **Reports**: Generate and download reports
      - **User Settings**: Manage user preferences and settings
      
      ### Authentication:
      Most endpoints require JWT Bearer token authentication. Use the /auth endpoints to obtain tokens.
    `)
    .setVersion('1.0')
    .setContact('Emergency Project Team', 'https://emergency-project.com', 'support@emergency-project.com')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Local Development Server')
    .addServer('https://api.emergency-project.com', 'Production Server')
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('SOS / Emergency Requests', 'Emergency request management')
    .addTag('Hospitals', 'Hospital management and capacity')
    .addTag('Rescue Teams', 'Rescue team management')
    .addTag('Dashboard', 'Dashboard statistics and monitoring')
    .addTag('Notifications', 'User notifications')
    .addTag('Reports', 'Report generation and download')
    .addTag('Settings', 'User settings and preferences')
    .addTag('Users', 'User profile management')
    .addTag('Health Check', 'API health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ❌ ไม่เขียนไฟล์ swagger.json ที่นี่ (ป้องกัน loop ใน dev)
  // หากต้องการ export ให้ใช้ export-swagger.ts

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Emergency Project API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📘 Swagger UI is available at: http://localhost:${port}/api`);
  console.log(`🌐 CORS configured for: ${clientUrl}`);
}
bootstrap();
