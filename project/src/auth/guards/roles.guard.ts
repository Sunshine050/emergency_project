import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the user has the required role to access a route
   * @param context The execution context
   * @returns Whether the user has the required role
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request object (set by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Check if user has one of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
