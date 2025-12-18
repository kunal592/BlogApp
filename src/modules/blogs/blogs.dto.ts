import {
    IsString,
    IsOptional,
    IsBoolean,
    IsInt,
    IsArray,
    MinLength,
    MaxLength,
    Min,
    Max,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Blog status enum matching Prisma
export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/**
 * DTO for creating a new blog
 */
export class CreateBlogDto {
    @ApiProperty({
        example: 'How to Build Scalable APIs with NestJS',
        description: 'Blog title',
    })
    @IsString()
    @MinLength(5, { message: 'Title must be at least 5 characters' })
    @MaxLength(200, { message: 'Title must not exceed 200 characters' })
    title!: string;

    @ApiPropertyOptional({
        example: 'A comprehensive guide for backend developers',
        description: 'Blog subtitle',
    })
    @IsOptional()
    @IsString()
    @MaxLength(300, { message: 'Subtitle must not exceed 300 characters' })
    subtitle?: string;

    @ApiProperty({
        example: '# Introduction\n\nThis is the blog content in **Markdown**...',
        description: 'Blog content in Markdown format',
    })
    @IsString()
    @MinLength(100, { message: 'Content must be at least 100 characters' })
    content!: string;

    @ApiPropertyOptional({
        example: 'Learn how to build production-ready APIs using NestJS...',
        description: 'Short excerpt for previews',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Excerpt must not exceed 500 characters' })
    excerpt?: string;

    @ApiPropertyOptional({
        example: 'https://example.com/cover.jpg',
        description: 'Cover image URL',
    })
    @IsOptional()
    @IsString()
    coverImage?: string;

    @ApiPropertyOptional({
        example: false,
        description: 'Whether blog requires payment to view',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isExclusive?: boolean;

    @ApiPropertyOptional({
        example: 100,
        description: 'Price in tokens (if exclusive)',
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10000)
    price?: number;

    @ApiPropertyOptional({
        example: ['nestjs', 'api', 'backend'],
        description: 'Array of tag names',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    // SEO fields
    @ApiPropertyOptional({
        example: 'Build Scalable APIs with NestJS | MyBlog',
        description: 'SEO meta title',
    })
    @IsOptional()
    @IsString()
    @MaxLength(70, { message: 'Meta title must not exceed 70 characters' })
    metaTitle?: string;

    @ApiPropertyOptional({
        example: 'Learn how to build production-ready, scalable REST APIs...',
        description: 'SEO meta description',
    })
    @IsOptional()
    @IsString()
    @MaxLength(160, { message: 'Meta description must not exceed 160 characters' })
    metaDescription?: string;

    @ApiPropertyOptional({
        example: 'nestjs, api, backend, typescript',
        description: 'SEO meta keywords',
    })
    @IsOptional()
    @IsString()
    metaKeywords?: string;
}

/**
 * DTO for updating a blog
 */
export class UpdateBlogDto {
    @ApiPropertyOptional({
        example: 'Updated Blog Title',
    })
    @IsOptional()
    @IsString()
    @MinLength(5, { message: 'Title must be at least 5 characters' })
    @MaxLength(200, { message: 'Title must not exceed 200 characters' })
    title?: string;

    @ApiPropertyOptional({ example: 'Updated subtitle' })
    @IsOptional()
    @IsString()
    @MaxLength(300)
    subtitle?: string;

    @ApiPropertyOptional({ example: '# Updated content' })
    @IsOptional()
    @IsString()
    @MinLength(100)
    content?: string;

    @ApiPropertyOptional({ example: 'Updated excerpt...' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    excerpt?: string;

    @ApiPropertyOptional({ example: 'https://example.com/new-cover.jpg' })
    @IsOptional()
    @IsString()
    coverImage?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isExclusive?: boolean;

    @ApiPropertyOptional({ example: 150 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10000)
    price?: number;

    @ApiPropertyOptional({ example: ['updated', 'tags'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(70)
    metaTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(160)
    metaDescription?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    metaKeywords?: string;
}

/**
 * Query params for blog listing
 */
export class BlogQueryDto {
    @ApiPropertyOptional({
        example: 1,
        description: 'Page number',
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
        description: 'Items per page',
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
        example: 'latest',
        description: 'Sort order',
        enum: ['latest', 'popular', 'trending'],
    })
    @IsOptional()
    @IsString()
    @IsEnum(['latest', 'popular', 'trending'])
    sort?: 'latest' | 'popular' | 'trending' = 'latest';

    @ApiPropertyOptional({
        example: 'nestjs',
        description: 'Search query',
    })
    @IsOptional()
    @IsString()
    search?: string;
}

/**
 * Query params for user's own blogs
 */
export class MyBlogsQueryDto extends BlogQueryDto {
    @ApiPropertyOptional({
        example: 'DRAFT',
        description: 'Filter by status',
        enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    })
    @IsOptional()
    @IsString()
    @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    status?: BlogStatus;
}

/**
 * Author info in blog response
 */
export class BlogAuthorDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiPropertyOptional({ example: 'johndoe' })
    username!: string | null;

    @ApiPropertyOptional({ example: 'John Doe' })
    name!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar!: string | null;

    @ApiProperty({ example: true })
    isVerified!: boolean;
}

/**
 * Tag in blog response
 */
export class BlogTagDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'NestJS' })
    name!: string;

    @ApiProperty({ example: 'nestjs' })
    slug!: string;
}

/**
 * Response DTO for blog
 */
export class BlogResponseDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'how-to-build-scalable-apis-with-nestjs' })
    slug!: string;

    @ApiProperty({ example: 'How to Build Scalable APIs with NestJS' })
    title!: string;

    @ApiPropertyOptional({ example: 'A comprehensive guide for developers' })
    subtitle!: string | null;

    @ApiProperty({ example: '# Introduction\n\nThis is the blog content...' })
    content!: string;

    @ApiPropertyOptional({ example: 'Learn how to build production-ready APIs...' })
    excerpt!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
    coverImage!: string | null;

    @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], example: 'PUBLISHED' })
    status!: BlogStatus;

    @ApiProperty({ example: false })
    isExclusive!: boolean;

    @ApiPropertyOptional({ example: 100 })
    price!: number | null;

    // Stats
    @ApiProperty({ example: 1500 })
    viewCount!: number;

    @ApiProperty({ example: 120 })
    likeCount!: number;

    @ApiProperty({ example: 45 })
    bookmarkCount!: number;

    @ApiProperty({ example: 23 })
    commentCount!: number;

    @ApiPropertyOptional({ example: 5 })
    readingTime!: number | null;

    // SEO
    @ApiPropertyOptional({ example: 'Build Scalable APIs with NestJS | MyBlog' })
    metaTitle!: string | null;

    @ApiPropertyOptional({ example: 'Learn how to build production-ready APIs...' })
    metaDescription!: string | null;

    // Timestamps
    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    updatedAt!: Date;

    @ApiPropertyOptional({ example: '2024-01-10T00:00:00.000Z' })
    publishedAt!: Date | null;

    // Relations
    @ApiProperty({ type: BlogAuthorDto })
    author!: BlogAuthorDto;

    @ApiProperty({ type: [BlogTagDto] })
    tags!: BlogTagDto[];

    // User-specific (only when authenticated)
    @ApiPropertyOptional({ example: true })
    isLiked?: boolean;

    @ApiPropertyOptional({ example: false })
    isBookmarked?: boolean;
}

/**
 * Blog list item (less detailed than full response)
 */
export class BlogListItemDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'how-to-build-scalable-apis-with-nestjs' })
    slug!: string;

    @ApiProperty({ example: 'How to Build Scalable APIs with NestJS' })
    title!: string;

    @ApiPropertyOptional({ example: 'A comprehensive guide for developers' })
    subtitle!: string | null;

    @ApiPropertyOptional({ example: 'Learn how to build production-ready APIs...' })
    excerpt!: string | null;

    @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
    coverImage!: string | null;

    @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
    status!: BlogStatus;

    @ApiProperty({ example: false })
    isExclusive!: boolean;

    @ApiProperty({ example: 1500 })
    viewCount!: number;

    @ApiProperty({ example: 120 })
    likeCount!: number;

    @ApiProperty({ example: 45 })
    bookmarkCount!: number;

    @ApiPropertyOptional({ example: 5 })
    readingTime!: number | null;

    @ApiPropertyOptional({ example: '2024-01-10T00:00:00.000Z' })
    publishedAt!: Date | null;

    @ApiProperty({ type: BlogAuthorDto })
    author!: BlogAuthorDto;

    @ApiProperty({ type: [BlogTagDto] })
    tags!: BlogTagDto[];

    @ApiPropertyOptional({ example: true })
    isLiked?: boolean;

    @ApiPropertyOptional({ example: false })
    isBookmarked?: boolean;
}

/**
 * Paginated blog list response
 */
export class PaginatedBlogsDto {
    @ApiProperty({ type: [BlogListItemDto] })
    data!: BlogListItemDto[];

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
