import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { join } from 'path';

async function generateSwaggerDocs() {
  // สร้าง NestJS application
  const app = await NestFactory.create(AppModule, { logger: false });

  // ตั้งค่า Swagger (ต้องตรงกับ main.ts)
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
    .setContact(
      'Emergency Project Team',
      'https://emergency-project.com',
      'support@emergency-project.com'
    )
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

  // สร้าง Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // เขียนไฟล์ Swagger JSON ที่ root
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  console.log('✅ สร้างไฟล์ Swagger JSON สำเร็จที่ ./swagger.json');

  // ตรวจสอบและสร้างโฟลเดอร์ public หากยังไม่มี
  const publicDir = join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // คัดลอกไปที่ public/swagger.json
  fs.copyFileSync('./swagger.json', join(publicDir, 'swagger.json'));
  console.log('✅ คัดลอกไฟล์ไปที่ ./public/swagger.json เรียบร้อยแล้ว');

  // ปิด application
  await app.close();
}

generateSwaggerDocs().catch((error) => {
  console.error('❌ เกิดข้อผิดพลาดในการสร้าง Swagger JSON:', error);
  process.exit(1);
});