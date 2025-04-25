import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Determines if the current route requires authentication
   * @param context The execution context
   * @returns Whether the request should proceed or be rejected
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route has the IS_PUBLIC_KEY metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If route is marked as public, allow access without authentication
    if (isPublic) {
      return true;
    }
    
    // Otherwise, use the parent AuthGuard to check JWT token
    return super.canActivate(context);
  }

  /**
   * Handles authentication errors
   * @param err Error from authentication
   * @param info Additional information
   * @returns Never - throws an exception
   */
  handleRequest(err: any, user: any, info: any) {
    // If authentication failed or no user was found
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    
    return user;
  }
}