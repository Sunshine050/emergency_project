import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";

export const Roles = (...roles: UserRole[]) => {
  console.log('Roles decorator called with:', roles);
  return SetMetadata(ROLES_KEY, roles);
};