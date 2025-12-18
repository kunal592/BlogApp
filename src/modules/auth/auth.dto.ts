import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    Matches,
} from 'class-validator';
import { Role } from '@prisma/client';

/**
 * DTO for user registration
 */
export class RegisterDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(128, { message: 'Password must not exceed 128 characters' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    password!: string;

    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;
}

/**
 * DTO for user login
 */
export class LoginDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @IsString()
    @MinLength(1, { message: 'Password is required' })
    password!: string;
}

/**
 * Response DTO for authenticated user
 */
export class UserResponseDto {
    id!: string;
    email!: string;
    name!: string | null;
    bio!: string | null;
    avatar!: string | null;
    role!: Role;
    isActive!: boolean;
    isVerified!: boolean;
    createdAt!: Date;
    updatedAt!: Date;
}

/**
 * Response DTO for auth operations
 */
export class AuthResponseDto {
    user!: UserResponseDto;
    accessToken?: string; // Only included if not using cookies
    message!: string;
}

/**
 * JWT Payload interface
 */
export interface JwtPayload {
    sub: string; // User ID
    email: string;
    role: Role;
    iat?: number;
    exp?: number;
}
