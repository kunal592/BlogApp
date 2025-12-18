import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
    ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UserResponseDto } from './auth.dto';
import { AUTH_API } from './auth.api';
import { Public, CurrentUser } from '../../common/decorators';
import { MESSAGES } from '../../common/constants';

@ApiTags('Auth')
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
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Create a new user account and receive authentication cookie',
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/UserResponseDto' },
                    },
                },
                message: { type: 'string', example: 'User registered successfully' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 409, description: 'Email already registered' })
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
    @ApiOperation({
        summary: 'Login with email and password',
        description: 'Authenticate user and receive JWT cookie',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/UserResponseDto' },
                    },
                },
                message: { type: 'string', example: 'Login successful' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
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
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Logout current user',
        description: 'Clear authentication cookie',
    })
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'null' },
                message: { type: 'string', example: 'Logout successful' },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
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
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get current user',
        description: 'Get the currently authenticated user profile',
    })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/UserResponseDto' },
                    },
                },
                timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getMe(
        @CurrentUser('id') userId: string,
    ): Promise<{ data: { user: UserResponseDto } }> {
        const user = await this.authService.getMe(userId);

        return {
            data: { user },
        };
    }
}
