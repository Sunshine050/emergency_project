import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./auth/decorators/public.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // สำหรับ /api (ตาม global prefix)
  @Public()
  getHelloWithPrefix(): { status: string; timestamp: string } {
    return this.appService.getHello();
  }

  @Get("/") // สำหรับ / โดยตรง (ข้าม global prefix)
  @Public()
  getHello(): { status: string; timestamp: string } {
    return this.appService.getHello();
  }
}
