import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Search query parameters
 */
export class SearchQueryDto {
    @ApiProperty({
        example: 'nestjs tutorial',
        description: 'Search query',
    })
    @IsString()
    q!: string;

    @ApiPropertyOptional({
        example: 'blogs',
        description: 'Search type',
        enum: ['blogs', 'users', 'all'],
        default: 'all',
    })
    @IsOptional()
    @IsString()
    @IsEnum(['blogs', 'users', 'all'])
    type?: 'blogs' | 'users' | 'all' = 'all';

    @ApiPropertyOptional({
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
        minimum: 1,
        maximum: 50,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}

/**
 * Query for feeds
 */
export class FeedQueryDto {
    @ApiPropertyOptional({
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
        minimum: 1,
        maximum: 50,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;

    @ApiPropertyOptional({
        example: 'week',
        description: 'Time period for trending',
        enum: ['day', 'week', 'month', 'all'],
        default: 'week',
    })
    @IsOptional()
    @IsString()
    @IsEnum(['day', 'week', 'month', 'all'])
    period?: 'day' | 'week' | 'month' | 'all' = 'week';
}

/**
 * Tag response
 */
export class TagResponseDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'NestJS' })
    name!: string;

    @ApiProperty({ example: 'nestjs' })
    slug!: string;

    @ApiProperty({ example: 150 })
    blogCount!: number;
}

/**
 * Creator/User in explore
 */
export class CreatorResponseDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiPropertyOptional({ example: 'johndoe' })
    username!: string | null;

    @ApiPropertyOptional({ example: 'John Doe' })
    name!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar!: string | null;

    @ApiPropertyOptional({ example: 'Software developer and blogger' })
    bio!: string | null;

    @ApiProperty({ example: true })
    isVerified!: boolean;

    @ApiProperty({ example: 5000 })
    followerCount!: number;

    @ApiProperty({ example: 42 })
    blogCount!: number;

    @ApiPropertyOptional({ example: false })
    isFollowing?: boolean;
}

/**
 * Blog in search results
 */
export class SearchBlogDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'how-to-build-apis' })
    slug!: string;

    @ApiProperty({ example: 'How to Build APIs' })
    title!: string;

    @ApiPropertyOptional({ example: 'A comprehensive guide...' })
    excerpt!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
    coverImage!: string | null;

    @ApiProperty({ example: 1500 })
    viewCount!: number;

    @ApiProperty({ example: 120 })
    likeCount!: number;

    @ApiPropertyOptional({ example: 5 })
    readingTime!: number | null;

    @ApiPropertyOptional({ example: '2024-01-10T00:00:00.000Z' })
    publishedAt!: Date | null;

    @ApiProperty()
    author!: {
        id: string;
        username: string | null;
        name: string | null;
        avatar: string | null;
        isVerified: boolean;
    };

    @ApiProperty({ type: [TagResponseDto] })
    tags!: TagResponseDto[];

    @ApiPropertyOptional({ example: false })
    isLiked?: boolean;

    @ApiPropertyOptional({ example: false })
    isBookmarked?: boolean;

    @ApiPropertyOptional({ example: false })
    isFollowing?: boolean;
}

/**
 * Search results
 */
export class SearchResultsDto {
    @ApiProperty({ type: [SearchBlogDto] })
    blogs!: SearchBlogDto[];

    @ApiProperty({ type: [CreatorResponseDto] })
    users!: CreatorResponseDto[];

    @ApiProperty({
        example: { page: 1, limit: 10, totalBlogs: 50, totalUsers: 10 },
    })
    meta!: {
        page: number;
        limit: number;
        totalBlogs: number;
        totalUsers: number;
    };
}

/**
 * Paginated blog feed
 */
export class PaginatedFeedDto {
    @ApiProperty({ type: [SearchBlogDto] })
    data!: SearchBlogDto[];

    @ApiProperty({
        example: { page: 1, limit: 10, total: 100, totalPages: 10 },
    })
    meta!: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Paginated tags
 */
export class PaginatedTagsDto {
    @ApiProperty({ type: [TagResponseDto] })
    data!: TagResponseDto[];

    @ApiProperty({
        example: { page: 1, limit: 20, total: 50, totalPages: 3 },
    })
    meta!: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Paginated creators
 */
export class PaginatedCreatorsDto {
    @ApiProperty({ type: [CreatorResponseDto] })
    data!: CreatorResponseDto[];

    @ApiProperty({
        example: { page: 1, limit: 10, total: 50, totalPages: 5 },
    })
    meta!: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
