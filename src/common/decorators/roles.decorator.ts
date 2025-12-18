import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access a route
 * Usage: @Roles(Role.ADMIN, Role.OWNER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
