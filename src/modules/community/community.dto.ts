import { IsString, IsOptional, IsUUID, MaxLength, MinLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating a comment
 */
export class CreateCommentDto {
    @ApiProperty({
        example: 'This is a great article!',
        description: 'Comment content',
        minLength: 1,
        maxLength: 1000,
    })
    @IsString()
    @MinLength(1)
    @MaxLength(1000)
    content!: string;

    @ApiProperty({
        example: 'clxxxxxxxxxxxxxxxxxx',
        description: 'ID of the blog being commented on',
    })
    @IsString()
    blogId!: string;

    @ApiPropertyOptional({
        example: 'clxxxxxxxxxxxxxxxxxx',
        description: 'ID of the parent comment if this is a reply',
    })
    @IsOptional()
    @IsString()
    parentId?: string;
}

/**
 * DTO for paginated queries
 */
export class CommentQueryDto {
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
        example: 20,
        minimum: 1,
        maximum: 100,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}

/**
 * User info in comment
 */
export class CommentUserDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'johndoe' })
    username!: string | null;

    @ApiProperty({ example: 'John Doe' })
    name!: string | null;

    @ApiProperty({ example: 'https://example.com/avatar.jpg' })
    avatar!: string | null;

    @ApiProperty({ example: true })
    isVerified!: boolean;
}

/**
 * Response DTO for a comment
 */
export class CommentResponseDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'This is a great article!' })
    content!: string;

    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    userId!: string;

    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    blogId!: string;

    @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxxx' })
    parentId!: string | null;

    @ApiProperty({ example: 5 })
    likeCount!: number;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    updatedAt!: Date;

    @ApiProperty({ type: CommentUserDto })
    user!: CommentUserDto;

    @ApiPropertyOptional({ example: true })
    isLiked?: boolean;

    @ApiPropertyOptional({
        type: 'array',
        items: {
            type: 'object',
            // recursive type reference is tricky in Swagger decorators, keeping it simple
        }
    })
    replies?: CommentResponseDto[];
}

/**
 * Paginated response
 */
export class PaginatedCommentsDto {
    @ApiProperty({ type: [CommentResponseDto] })
    data!: CommentResponseDto[];

    @ApiProperty({
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
        },
    })
    meta!: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
