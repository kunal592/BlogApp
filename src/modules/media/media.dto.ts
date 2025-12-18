import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Media type enum matching Prisma
export type MediaType = 'IMAGE' | 'DOCUMENT' | 'OTHER';
export type MediaPurpose = 'AVATAR' | 'COVER' | 'INLINE' | 'GENERAL';

/**
 * Query params for media listing
 */
export class MediaQueryDto {
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
        example: 20,
        description: 'Items per page',
        minimum: 1,
        maximum: 50,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;

    @ApiPropertyOptional({
        example: 'IMAGE',
        description: 'Filter by media type',
        enum: ['IMAGE', 'DOCUMENT', 'OTHER'],
    })
    @IsOptional()
    @IsString()
    @IsEnum(['IMAGE', 'DOCUMENT', 'OTHER'])
    type?: MediaType;
}

/**
 * DTO for requesting a signed upload URL
 */
export class SignedUrlRequestDto {
    @ApiProperty({
        example: 'my-image.jpg',
        description: 'Filename to upload',
    })
    @IsString()
    filename!: string;

    @ApiProperty({
        example: 'image/jpeg',
        description: 'MIME type of the file',
    })
    @IsString()
    mimeType!: string;

    @ApiPropertyOptional({
        example: 1048576,
        description: 'File size in bytes',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    size?: number;

    @ApiPropertyOptional({
        example: 'COVER',
        description: 'Purpose of the upload',
        enum: ['AVATAR', 'COVER', 'INLINE', 'GENERAL'],
    })
    @IsOptional()
    @IsString()
    @IsEnum(['AVATAR', 'COVER', 'INLINE', 'GENERAL'])
    purpose?: MediaPurpose;

    @ApiPropertyOptional({
        example: 'clxxxxxxxxxxxxxxxxxx',
        description: 'Blog ID to associate with (for covers/inline)',
    })
    @IsOptional()
    @IsString()
    blogId?: string;
}

/**
 * Response DTO for media
 */
export class MediaResponseDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'my-image.jpg' })
    filename!: string;

    @ApiProperty({ example: 'https://cdn.example.com/media/abc123.jpg' })
    url!: string;

    @ApiProperty({ example: 'image/jpeg' })
    mimeType!: string;

    @ApiProperty({ example: 1048576 })
    size!: number;

    @ApiProperty({ enum: ['IMAGE', 'DOCUMENT', 'OTHER'], example: 'IMAGE' })
    type!: MediaType;

    @ApiProperty({ enum: ['AVATAR', 'COVER', 'INLINE', 'GENERAL'], example: 'COVER' })
    purpose!: MediaPurpose;

    @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxxxx' })
    blogId!: string | null;

    @ApiPropertyOptional({ example: 'A beautiful sunset' })
    alt!: string | null;

    @ApiPropertyOptional({ example: 1920 })
    width!: number | null;

    @ApiPropertyOptional({ example: 1080 })
    height!: number | null;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt!: Date;
}

/**
 * Response for signed URL
 */
export class SignedUrlResponseDto {
    @ApiProperty({
        example: 'https://bucket.s3.amazonaws.com/...',
        description: 'Presigned URL for direct upload',
    })
    uploadUrl!: string;

    @ApiProperty({
        example: 'media/user123/abc123.jpg',
        description: 'Key/path in the storage bucket',
    })
    key!: string;

    @ApiProperty({
        example: 'https://cdn.example.com/media/user123/abc123.jpg',
        description: 'Public URL after upload is complete',
    })
    publicUrl!: string;

    @ApiProperty({
        example: 3600,
        description: 'Seconds until the signed URL expires',
    })
    expiresIn!: number;
}

/**
 * Paginated media list response
 */
export class PaginatedMediaDto {
    @ApiProperty({ type: [MediaResponseDto] })
    data!: MediaResponseDto[];

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
