import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function generateSwaggerDocs() {
  // สร้าง NestJS application
  const app = await NestFactory.create(AppModule, { logger: false });

  // ตั้งค่า Swagger
  const config = new DocumentBuilder()
    .setTitle('Emergency Project API')
    .setDescription('API documentation for Emergency Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // สร้าง Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // เขียนไฟล์ Swagger JSON
  fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  console.log('สร้างไฟล์ Swagger JSON สำเร็จที่ ./swagger.json');

  // ปิด application
  await app.close();
}

generateSwaggerDocs().catch((error) => {
  console.error('เกิดข้อผิดพลาดในการสร้าง Swagger JSON:', error);
  process.exit(1);
});