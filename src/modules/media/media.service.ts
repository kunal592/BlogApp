import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';
import {
    MediaQueryDto,
    SignedUrlRequestDto,
    MediaResponseDto,
    SignedUrlResponseDto,
    PaginatedMediaDto,
    MediaType,
    MediaPurpose,
} from './media.dto';
import { randomUUID } from 'crypto';

// Type for Media record from Prisma
type MediaRecord = {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
    type: string;
    purpose: string;
    blogId: string | null;
    alt: string | null;
    width: number | null;
    height: number | null;
    createdAt: Date;
};

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly publicUrl: string;
    private readonly signedUrlExpiry: number;
    private readonly maxFileSize: number;
    private readonly allowedImageTypes: string[];
    private readonly allowedDocumentTypes: string[];

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        const endpoint = this.configService.get<string>('storage.endpoint');
        const region = this.configService.get<string>('storage.region') || 'auto';
        const accessKeyId = this.configService.get<string>('storage.accessKeyId');
        const secretAccessKey = this.configService.get<string>('storage.secretAccessKey');

        this.bucket = this.configService.get<string>('storage.bucket') || 'media';
        this.publicUrl = this.configService.get<string>('storage.publicUrl') || '';
        this.signedUrlExpiry = this.configService.get<number>('storage.signedUrlExpiry') || 3600;
        this.maxFileSize = this.configService.get<number>('storage.maxFileSize') || 10485760;
        this.allowedImageTypes = this.configService.get<string[]>('storage.allowedImageTypes') || [];
        this.allowedDocumentTypes = this.configService.get<string[]>('storage.allowedDocumentTypes') || [];

        // Initialize S3 client (works with Cloudflare R2)
        this.s3Client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId: accessKeyId || '',
                secretAccessKey: secretAccessKey || '',
            },
        });
    }

    /**
     * Determine media type from MIME type
     */
    private getMediaType(mimeType: string): MediaType {
        if (this.allowedImageTypes.includes(mimeType)) {
            return 'IMAGE';
        }
        if (this.allowedDocumentTypes.includes(mimeType)) {
            return 'DOCUMENT';
        }
        return 'OTHER';
    }

    /**
     * Validate file type
     */
    private validateFileType(mimeType: string): void {
        const allowed = [...this.allowedImageTypes, ...this.allowedDocumentTypes];
        if (!allowed.includes(mimeType)) {
            throw new BadRequestException(
                `File type ${mimeType} is not allowed. Allowed types: ${allowed.join(', ')}`,
            );
        }
    }

    /**
     * Validate file size
     */
    private validateFileSize(size: number): void {
        if (size > this.maxFileSize) {
            throw new BadRequestException(
                `File size ${size} exceeds maximum allowed size of ${this.maxFileSize} bytes`,
            );
        }
    }

    /**
     * Generate unique file key
     */
    private generateKey(userId: string, filename: string): string {
        const ext = filename.split('.').pop() || '';
        const uuid = randomUUID();
        return `media/${userId}/${uuid}.${ext}`;
    }

    /**
     * Get public URL for a key
     */
    private getPublicUrl(key: string): string {
        if (this.publicUrl) {
            return `${this.publicUrl}/${key}`;
        }
        // Fallback to S3 URL format
        return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }

    /**
     * Upload a file from buffer
     */
    async uploadFile(
        userId: string,
        file: Express.Multer.File,
        purpose: MediaPurpose = 'GENERAL',
        blogId?: string,
    ): Promise<MediaResponseDto> {
        this.validateFileType(file.mimetype);
        this.validateFileSize(file.size);

        const key = this.generateKey(userId, file.originalname);
        const mediaType = this.getMediaType(file.mimetype);

        // Upload to S3/R2
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        // Save to database
        const media = await this.prisma.media.create({
            data: {
                userId,
                filename: file.originalname,
                key,
                url: this.getPublicUrl(key),
                mimeType: file.mimetype,
                size: file.size,
                type: mediaType,
                purpose,
                blogId,
            },
        });

        this.logger.log(`File uploaded: ${key} by user ${userId} (purpose: ${purpose})`);

        return this.toMediaResponseDto(media);
    }

    /**
     * Upload multiple files
     */
    async uploadFiles(
        userId: string,
        files: Express.Multer.File[],
    ): Promise<MediaResponseDto[]> {
        const results: MediaResponseDto[] = [];

        for (const file of files) {
            const result = await this.uploadFile(userId, file);
            results.push(result);
        }

        return results;
    }

    /**
     * Generate a presigned URL for direct browser upload
     */
    async getSignedUploadUrl(
        userId: string,
        dto: SignedUrlRequestDto,
    ): Promise<SignedUrlResponseDto> {
        this.validateFileType(dto.mimeType);
        if (dto.size) {
            this.validateFileSize(dto.size);
        }

        const key = this.generateKey(userId, dto.filename);

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: dto.mimeType,
        });

        const uploadUrl = await getSignedUrl(this.s3Client, command, {
            expiresIn: this.signedUrlExpiry,
        });

        return {
            uploadUrl,
            key,
            publicUrl: this.getPublicUrl(key),
            expiresIn: this.signedUrlExpiry,
        };
    }

    /**
     * Confirm upload from signed URL (creates DB record)
     */
    async confirmUpload(
        userId: string,
        key: string,
        filename: string,
        mimeType: string,
        purpose: MediaPurpose = 'GENERAL',
        blogId?: string,
    ): Promise<MediaResponseDto> {
        // Verify file exists in S3
        try {
            const headResult = await this.s3Client.send(
                new HeadObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );

            const size = headResult.ContentLength || 0;
            const mediaType = this.getMediaType(mimeType);

            const media = await this.prisma.media.create({
                data: {
                    userId,
                    filename,
                    key,
                    url: this.getPublicUrl(key),
                    mimeType,
                    size,
                    type: mediaType,
                    purpose,
                    blogId,
                },
            });

            this.logger.log(`Upload confirmed: ${key} by user ${userId}`);

            return this.toMediaResponseDto(media);
        } catch {
            throw new BadRequestException('File not found in storage. Upload may have failed.');
        }
    }

    /**
     * Attach media to a blog
     */
    async attachToBlog(
        mediaId: string,
        blogId: string,
        purpose: MediaPurpose,
        userId: string,
    ): Promise<MediaResponseDto> {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
        });

        if (!media || media.deletedAt) {
            throw new NotFoundException('Media not found');
        }

        if (media.userId !== userId) {
            throw new ForbiddenException('You can only attach your own media');
        }

        // If this is a cover image, detach any existing cover for this blog
        if (purpose === 'COVER') {
            await this.prisma.media.updateMany({
                where: {
                    blogId,
                    purpose: 'COVER',
                    deletedAt: null,
                },
                data: {
                    blogId: null,
                    purpose: 'GENERAL',
                },
            });
        }

        const updatedMedia = await this.prisma.media.update({
            where: { id: mediaId },
            data: {
                blogId,
                purpose,
            },
        });

        this.logger.log(`Media ${mediaId} attached to blog ${blogId} as ${purpose}`);

        return this.toMediaResponseDto(updatedMedia);
    }

    /**
     * Detach media from a blog
     */
    async detachFromBlog(mediaId: string, userId: string): Promise<MediaResponseDto> {
        const media = await this.prisma.media.findUnique({
            where: { id: mediaId },
        });

        if (!media || media.deletedAt) {
            throw new NotFoundException('Media not found');
        }

        if (media.userId !== userId) {
            throw new ForbiddenException('You can only detach your own media');
        }

        const updatedMedia = await this.prisma.media.update({
            where: { id: mediaId },
            data: {
                blogId: null,
                purpose: 'GENERAL',
            },
        });

        this.logger.log(`Media ${mediaId} detached from blog`);

        return this.toMediaResponseDto(updatedMedia);
    }

    /**
     * Get media for a blog
     */
    async findByBlog(blogId: string): Promise<MediaResponseDto[]> {
        const media = await this.prisma.media.findMany({
            where: {
                blogId,
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });

        return media.map((m: MediaRecord) => this.toMediaResponseDto(m));
    }

    /**
     * Get cover image for a blog
     */
    async findCoverByBlog(blogId: string): Promise<MediaResponseDto | null> {
        const media = await this.prisma.media.findFirst({
            where: {
                blogId,
                purpose: 'COVER',
                deletedAt: null,
            },
        });

        return media ? this.toMediaResponseDto(media) : null;
    }

    /**
     * Cleanup orphaned media for a blog (when blog is deleted)
     */
    async cleanupBlogMedia(blogId: string): Promise<void> {
        await this.prisma.media.updateMany({
            where: {
                blogId,
                deletedAt: null,
            },
            data: {
                blogId: null,
                purpose: 'GENERAL',
            },
        });

        this.logger.log(`Cleaned up media for blog ${blogId}`);
    }

    /**
     * Get media by ID
     */
    async findById(id: string, userId?: string): Promise<MediaResponseDto> {
        const media = await this.prisma.media.findUnique({
            where: { id },
        });

        if (!media || media.deletedAt) {
            throw new NotFoundException('Media not found');
        }

        return this.toMediaResponseDto(media);
    }

    /**
     * Get user's media
     */
    async findByUser(
        userId: string,
        query: MediaQueryDto,
    ): Promise<PaginatedMediaDto> {
        const { page = 1, limit = 20, type } = query;
        const skip = (page - 1) * limit;

        const where: {
            userId: string;
            deletedAt: null;
            type?: MediaType;
        } = {
            userId,
            deletedAt: null,
        };

        if (type) {
            where.type = type;
        }

        const [media, total] = await Promise.all([
            this.prisma.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.media.count({ where }),
        ]);

        return {
            data: media.map((m: MediaRecord) => this.toMediaResponseDto(m)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Delete media
     */
    async delete(id: string, userId: string): Promise<void> {
        const media = await this.prisma.media.findUnique({
            where: { id },
        });

        if (!media || media.deletedAt) {
            throw new NotFoundException('Media not found');
        }

        if (media.userId !== userId) {
            throw new ForbiddenException('You can only delete your own media');
        }

        // Delete from S3/R2
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: media.key,
                }),
            );
        } catch {
            this.logger.warn(`Failed to delete from S3: ${media.key}`);
        }

        // Soft delete from database
        await this.prisma.media.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        this.logger.log(`Media ${id} deleted by user ${userId}`);
    }

    /**
     * Convert to response DTO
     */
    private toMediaResponseDto(media: {
        id: string;
        filename: string;
        url: string;
        mimeType: string;
        size: number;
        type: string;
        purpose: string;
        blogId: string | null;
        alt: string | null;
        width: number | null;
        height: number | null;
        createdAt: Date;
    }): MediaResponseDto {
        return {
            id: media.id,
            filename: media.filename,
            url: media.url,
            mimeType: media.mimeType,
            size: media.size,
            type: media.type as MediaType,
            purpose: media.purpose as MediaPurpose,
            blogId: media.blogId,
            alt: media.alt,
            width: media.width,
            height: media.height,
            createdAt: media.createdAt,
        };
    }
}
