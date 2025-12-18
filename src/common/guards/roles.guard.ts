import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLE_HIERARCHY } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // If no user, deny access
        if (!user) {
            return false;
        }

        // Check if user has any of the required roles
        // Using role hierarchy - higher roles inherit lower role permissions
        const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;

        return requiredRoles.some((role) => {
            const requiredRoleLevel = ROLE_HIERARCHY[role] || 0;
            return userRoleLevel >= requiredRoleLevel;
        });
    }
}
