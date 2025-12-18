import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Role enum matching Prisma schema
export type Role = 'USER' | 'CREATOR' | 'ADMIN' | 'OWNER';

/**
 * DTO for user registration
 */
export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @ApiProperty({
        example: 'SecurePass@123',
        description:
            'Password (min 8 chars, must include uppercase, lowercase, number, and special char)',
        minLength: 8,
    })
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

    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'User display name',
    })
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
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;

    @ApiProperty({
        example: 'SecurePass@123',
        description: 'User password',
    })
    @IsString()
    @MinLength(1, { message: 'Password is required' })
    password!: string;
}

/**
 * Response DTO for authenticated user
 */
export class UserResponseDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'user@example.com' })
    email!: string;

    @ApiPropertyOptional({ example: 'John Doe' })
    name!: string | null;

    @ApiPropertyOptional({ example: 'Software developer and blogger' })
    bio!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar!: string | null;

    @ApiProperty({ enum: ['USER', 'CREATOR', 'ADMIN', 'OWNER'], example: 'USER' })
    role!: Role;

    @ApiProperty({ example: true })
    isActive!: boolean;

    @ApiProperty({ example: false })
    isVerified!: boolean;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    updatedAt!: Date;
}

/**
 * Response DTO for auth operations
 */
export class AuthResponseDto {
    @ApiProperty({ type: UserResponseDto })
    user!: UserResponseDto;

    @ApiPropertyOptional({
        description: 'Only included if not using cookies',
    })
    accessToken?: string;

    @ApiProperty({ example: 'Login successful' })
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
