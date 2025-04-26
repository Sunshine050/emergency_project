import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): { status: string; timestamp: string } {
    return {
      status: "ok Let's go!",
      timestamp: new Date().toISOString(),
    };
  }
}
