import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the current user from the request
 * Usage: @CurrentUser() user: User
 * Usage: @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        const user = request.user;

        if (!user) {
            return null;
        }

        return data ? user[data as keyof typeof user] : user;
    },
);
