import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Log the error
    this.logger.error(
      `[${request.method}] ${request.url} - ${status}: ${
        typeof errorResponse === "object"
          ? JSON.stringify(errorResponse)
          : errorResponse
      }`,
    );

    // Structure the error response
    const formattedError = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error:
        typeof errorResponse === "object"
          ? errorResponse
          : { message: errorResponse },
    };

    response.status(status).json(formattedError);
  }
}
