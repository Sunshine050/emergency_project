import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedocModule, RedocOptions } from 'nestjs-redoc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  const configService = app.get(ConfigService);
  
  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
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

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configure Redoc
  const redocOptions: RedocOptions = {
    title: 'API Documentation',
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false,
  };
  
  await RedocModule.setup('/api/redoc', app, document, redocOptions);
  
  // Get port from environment variables
  const port = configService.get('PORT') || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI available at: http://localhost:${port}/api/docs`);
  console.log(`Redoc available at: http://localhost:${port}/api/redoc`);
}
bootstrap();