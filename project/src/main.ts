import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"; // เพิ่ม import
import { RedocModule, RedocOptions } from "nestjs-redoc"; // เพิ่ม import สำหรับ Redoc

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(["log", "error", "warn", "debug", "verbose"]);
  const configService = app.get(ConfigService);

  // Setup WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app.getHttpServer()));

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
    .setTitle("Emergency Project API")
    .setDescription("API documentation for Emergency Project")
    .setVersion("1.0")
    .addBearerAuth() // เพิ่ม Bearer Authentication สำหรับ JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document); // Swagger UI จะอยู่ที่ /api

  // ตั้งค่า Redoc
  const redocOptions: RedocOptions = {
    title: "Emergency Project API",
    logo: {
      url: "https://example.com/logo.png", // Replace with your logo URL
    },
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false,
  };
  await RedocModule.setup("docs", app, document, redocOptions); // Redoc UI จะอยู่ที่ /docs

  // Get port from environment variables
  const port = configService.get("PORT") || 3000;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api`);
  console.log(`Redoc UI is available at: http://localhost:${port}/docs`); // เพิ่ม log
}bootstrap();
