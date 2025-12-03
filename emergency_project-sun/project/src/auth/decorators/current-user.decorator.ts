import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Parameter decorator to extract the current user from the request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
