import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UserResponseDto } from './auth.dto';
import { AUTH_API } from './auth.api';
import { Public, CurrentUser } from '../../common/decorators';
import { MESSAGES } from '../../common/constants';

@Controller(AUTH_API.BASE)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /auth/register
     * Register a new user
     */
    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.register(dto);

        // Set JWT in HTTP-only cookie
        response.cookie(
            this.authService.getCookieName(),
            result.accessToken,
            this.authService.getCookieOptions(),
        );

        // Return user without token in body (token is in cookie)
        return {
            data: { user: result.user },
            message: result.message,
        };
    }

    /**
     * POST /auth/login
     * Login with email and password
     */
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.login(dto);

        // Set JWT in HTTP-only cookie
        response.cookie(
            this.authService.getCookieName(),
            result.accessToken,
            this.authService.getCookieOptions(),
        );

        // Return user without token in body (token is in cookie)
        return {
            data: { user: result.user },
            message: result.message,
        };
    }

    /**
     * POST /auth/logout
     * Logout current user
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {
        // Clear the auth cookie
        response.clearCookie(this.authService.getCookieName(), {
            ...this.authService.getCookieOptions(),
            maxAge: 0,
        });

        return {
            data: null,
            message: MESSAGES.AUTH.LOGOUT_SUCCESS,
        };
    }

    /**
     * GET /auth/me
     * Get current authenticated user
     */
    @Get('me')
    @HttpCode(HttpStatus.OK)
    async getMe(
        @CurrentUser('id') userId: string,
    ): Promise<{ data: { user: UserResponseDto } }> {
        const user = await this.authService.getMe(userId);

        return {
            data: { user },
        };
    }
}
