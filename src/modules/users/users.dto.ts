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

// Role enum matching Prisma schema
export type Role = 'USER' | 'CREATOR' | 'ADMIN' | 'OWNER';

/**
 * DTO for updating user profile
 */
export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
    bio?: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}

/**
 * Query params for pagination
 */
export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

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
    id!: string;
    username!: string | null;
    email!: string;
    name!: string | null;
    bio!: string | null;
    avatar!: string | null;
    role!: Role;
    isVerified!: boolean;
    followerCount!: number;
    followingCount!: number;
    createdAt!: Date;
}

/**
 * Response DTO for public profile (less info)
 */
export class PublicProfileDto {
    id!: string;
    username!: string | null;
    name!: string | null;
    bio!: string | null;
    avatar!: string | null;
    role!: Role;
    isVerified!: boolean;
    followerCount!: number;
    followingCount!: number;
    createdAt!: Date;
    isFollowing?: boolean; // Only present when authenticated
}

/**
 * Response DTO for follow list items
 */
export class FollowUserDto {
    id!: string;
    username!: string | null;
    name!: string | null;
    avatar!: string | null;
    bio!: string | null;
    isVerified!: boolean;
    isFollowing?: boolean;
}

/**
 * Response for paginated lists
 */
export class PaginatedResponseDto<T> {
    data!: T[];
    meta!: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Response for follow status
 */
export class FollowStatusDto {
    isFollowing!: boolean;
    followedAt?: Date;
}
