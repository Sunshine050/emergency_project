import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Emergency Project API')
    .setDescription('API documentation for Emergency Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ✅ สร้างไฟล์ swagger.json แบบ standalone
  try {
    writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
    console.log('✅ Swagger spec exported to ./swagger.json');
  } catch (error) {
    console.error('❌ Failed to write swagger.json:', error);
  }

  await app.close();
}

generateSwagger();
