import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from "./app.service";
import { Public } from "./auth/decorators/public.decorator";

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'API health check', description: 'Check if the API is running' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHelloWithPrefix(): { status: string; timestamp: string } {
    return this.appService.getHello();
  }

  @Get("/")
  @Public()
  @ApiOperation({ summary: 'Root health check', description: 'Check if the server is running' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  getHello(): { status: string; timestamp: string } {
    return this.appService.getHello();
  }
}
