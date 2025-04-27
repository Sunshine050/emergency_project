import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const methodName = context.getHandler().name;
      console.log('RolesGuard - Method being called:', methodName);

      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      console.log('RolesGuard - Required Roles:', requiredRoles);

      if (!requiredRoles || requiredRoles.length === 0) {
        console.log('RolesGuard - No required roles, allowing access');
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const { user } = request;
      console.log('RolesGuard - User from request:', user);

      if (!user) {
        console.error('RolesGuard - Error: No user found in request');
        return false;
      }

      console.log('RolesGuard - User Role:', user.role);
      console.log('RolesGuard - Type of User Role:', typeof user.role);
      console.log('RolesGuard - Type of Required Roles:', requiredRoles.map(role => typeof role));

      const match = requiredRoles.some(
        (role) => user.role && String(user.role).toUpperCase() === String(role).toUpperCase()
      );
      console.log('RolesGuard - Role Match:', match);

      if (!match) {
        console.error('RolesGuard - Error: Role does not match. User Role:', user.role, 'Required Roles:', requiredRoles);
      }

      return match;
    } catch (error) {
      console.error('RolesGuard - Error during role validation:', error.message);
      return false;
    }
  }
}