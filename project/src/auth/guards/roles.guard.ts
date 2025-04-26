import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Log the method being called
    const methodName = context.getHandler().name;
    console.log('Method being called:', methodName);

    // Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    console.log('Required Roles:', requiredRoles);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('No required roles, allowing access');
      return true;
    }

    // Get the user from the request object (set by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    console.log('User:', user);
    console.log('User Role:', user.role);
    console.log('Type of User Role:', typeof user.role);
    console.log('Type of Required Roles:', requiredRoles.map(role => typeof role));

    // Compare roles in a case-insensitive manner
    const match = requiredRoles.some(
      (role) => String(user.role).toUpperCase() === String(role).toUpperCase()
    );
    console.log('Match:', match);

    return match;
  }
}