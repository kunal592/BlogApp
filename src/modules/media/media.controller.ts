import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    HttpCode,
    HttpStatus,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiCookieAuth,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MEDIA_API } from './media.api';
import {
    MediaQueryDto,
    SignedUrlRequestDto,
    MediaResponseDto,
    SignedUrlResponseDto,
    PaginatedMediaDto,
} from './media.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Media')
@Controller(MEDIA_API.BASE)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    /**
     * POST /media/upload
     * Upload a single file
     */
    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload a file',
        description: 'Upload a single file. Max size: 10MB. Allowed: images, PDFs.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'File uploaded', type: MediaResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid file type or size' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async upload(
        @CurrentUser('id') userId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                    new FileTypeValidator({
                        fileType: /(image\/(jpeg|png|gif|webp|svg\+xml)|application\/pdf)/,
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
    ): Promise<{ data: MediaResponseDto; message: string }> {
        const media = await this.mediaService.uploadFile(userId, file);
        return {
            data: media,
            message: 'File uploaded successfully',
        };
    }

    /**
     * POST /media/upload-multiple
     * Upload multiple files
     */
    @Post('upload-multiple')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload multiple files',
        description: 'Upload up to 10 files at once.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Files uploaded', type: [MediaResponseDto] })
    @ApiResponse({ status: 400, description: 'Invalid file type or size' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async uploadMultiple(
        @CurrentUser('id') userId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<{ data: MediaResponseDto[]; message: string }> {
        const media = await this.mediaService.uploadFiles(userId, files);
        return {
            data: media,
            message: `${media.length} files uploaded successfully`,
        };
    }

    /**
     * POST /media/signed-url
     * Get a presigned upload URL
     */
    @Post('signed-url')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get signed upload URL',
        description: 'Get a presigned URL for direct browser upload to S3/R2.',
    })
    @ApiResponse({ status: 200, description: 'Signed URL generated', type: SignedUrlResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid file type' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getSignedUrl(
        @CurrentUser('id') userId: string,
        @Body() dto: SignedUrlRequestDto,
    ): Promise<{ data: SignedUrlResponseDto }> {
        const result = await this.mediaService.getSignedUploadUrl(userId, dto);
        return { data: result };
    }

    /**
     * GET /media/my
     * Get current user's media
     */
    @Get('my')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get my media',
        description: 'Get all media uploaded by current user.',
    })
    @ApiResponse({ status: 200, description: 'Media retrieved', type: PaginatedMediaDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getMyMedia(
        @CurrentUser('id') userId: string,
        @Query() query: MediaQueryDto,
    ): Promise<PaginatedMediaDto> {
        return this.mediaService.findByUser(userId, query);
    }

    /**
     * GET /media/:id
     * Get media by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get media by ID',
        description: 'Get a single media file by its ID.',
    })
    @ApiParam({ name: 'id', description: 'Media ID' })
    @ApiResponse({ status: 200, description: 'Media retrieved', type: MediaResponseDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Media not found' })
    async getById(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ data: MediaResponseDto }> {
        const media = await this.mediaService.findById(id, userId);
        return { data: media };
    }

    /**
     * DELETE /media/:id
     * Delete media
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Delete media',
        description: 'Delete a media file. Only the uploader can delete.',
    })
    @ApiParam({ name: 'id', description: 'Media ID' })
    @ApiResponse({ status: 200, description: 'Media deleted' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not the owner' })
    @ApiResponse({ status: 404, description: 'Media not found' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.mediaService.delete(id, userId);
        return { message: 'Media deleted successfully' };
    }

    /**
     * POST /media/:id/attach
     * Attach media to a blog
     */
    @Post(':id/attach')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Attach media to blog',
        description: 'Attach a media file to a blog as cover or inline image.',
    })
    @ApiParam({ name: 'id', description: 'Media ID' })
    @ApiResponse({ status: 200, description: 'Media attached', type: MediaResponseDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not the owner' })
    @ApiResponse({ status: 404, description: 'Media not found' })
    async attachToBlog(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() body: { blogId: string; purpose: 'COVER' | 'INLINE' },
    ): Promise<{ data: MediaResponseDto; message: string }> {
        const media = await this.mediaService.attachToBlog(
            id,
            body.blogId,
            body.purpose,
            userId,
        );
        return {
            data: media,
            message: `Media attached as ${body.purpose.toLowerCase()}`,
        };
    }

    /**
     * POST /media/:id/detach
     * Detach media from blog
     */
    @Post(':id/detach')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Detach media from blog',
        description: 'Remove media association from a blog.',
    })
    @ApiParam({ name: 'id', description: 'Media ID' })
    @ApiResponse({ status: 200, description: 'Media detached', type: MediaResponseDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not the owner' })
    @ApiResponse({ status: 404, description: 'Media not found' })
    async detachFromBlog(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ data: MediaResponseDto; message: string }> {
        const media = await this.mediaService.detachFromBlog(id, userId);
        return {
            data: media,
            message: 'Media detached from blog',
        };
    }

    /**
     * GET /media/blog/:blogId
     * Get all media for a blog
     */
    @Get('blog/:blogId')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get blog media',
        description: 'Get all media attached to a specific blog.',
    })
    @ApiParam({ name: 'blogId', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Media retrieved', type: [MediaResponseDto] })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getBlogMedia(
        @Param('blogId') blogId: string,
    ): Promise<{ data: MediaResponseDto[] }> {
        const media = await this.mediaService.findByBlog(blogId);
        return { data: media };
    }
}
