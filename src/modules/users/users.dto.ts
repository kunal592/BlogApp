import {
    IsString,
    IsOptional,
    MinLength,
    MaxLength,
    Matches,
    IsInt,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Role enum matching Prisma schema
export type Role = 'USER' | 'CREATOR' | 'ADMIN' | 'OWNER';

/**
 * DTO for updating user profile
 */
export class UpdateProfileDto {
    @ApiPropertyOptional({
        example: 'johndoe',
        description: 'Unique username (3-30 chars, alphanumeric and underscores)',
    })
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username?: string;

    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'Display name',
    })
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    @ApiPropertyOptional({
        example: 'Software developer passionate about AI and blogging',
        description: 'User bio (max 500 chars)',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
    bio?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/avatar.jpg',
        description: 'Avatar image URL',
    })
    @IsOptional()
    @IsString()
    avatar?: string;
}

/**
 * Query params for pagination
 */
export class PaginationQueryDto {
    @ApiPropertyOptional({
        example: 1,
        description: 'Page number (1-indexed)',
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 20,
        description: 'Items per page',
        minimum: 1,
        maximum: 100,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}

/**
 * Response DTO for user profile
 */
export class UserProfileDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiPropertyOptional({ example: 'johndoe' })
    username!: string | null;

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

    @ApiProperty({ example: false })
    isVerified!: boolean;

    @ApiProperty({ example: 150 })
    followerCount!: number;

    @ApiProperty({ example: 75 })
    followingCount!: number;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt!: Date;
}

/**
 * Response DTO for public profile (less info)
 */
export class PublicProfileDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiPropertyOptional({ example: 'johndoe' })
    username!: string | null;

    @ApiPropertyOptional({ example: 'John Doe' })
    name!: string | null;

    @ApiPropertyOptional({ example: 'Software developer and blogger' })
    bio!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar!: string | null;

    @ApiProperty({ enum: ['USER', 'CREATOR', 'ADMIN', 'OWNER'], example: 'CREATOR' })
    role!: Role;

    @ApiProperty({ example: true })
    isVerified!: boolean;

    @ApiProperty({ example: 1500 })
    followerCount!: number;

    @ApiProperty({ example: 200 })
    followingCount!: number;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt!: Date;

    @ApiPropertyOptional({
        example: true,
        description: 'Whether current user follows this user',
    })
    isFollowing?: boolean;
}

/**
 * Response DTO for follow list items
 */
export class FollowUserDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiPropertyOptional({ example: 'johndoe' })
    username!: string | null;

    @ApiPropertyOptional({ example: 'John Doe' })
    name!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar!: string | null;

    @ApiPropertyOptional({ example: 'Software developer' })
    bio!: string | null;

    @ApiProperty({ example: true })
    isVerified!: boolean;

    @ApiPropertyOptional({
        example: false,
        description: 'Whether current user follows this user',
    })
    isFollowing?: boolean;
}

/**
 * Pagination meta information
 */
export class PaginationMetaDto {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 20 })
    limit!: number;

    @ApiProperty({ example: 100 })
    total!: number;

    @ApiProperty({ example: 5 })
    totalPages!: number;
}

/**
 * Response for paginated lists
 */
export class PaginatedResponseDto<T> {
    data!: T[];
    meta!: PaginationMetaDto;
}

/**
 * Response for follow status
 */
export class FollowStatusDto {
    @ApiProperty({ example: true })
    isFollowing!: boolean;

    @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
    followedAt?: Date;
}
