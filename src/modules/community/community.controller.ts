import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { COMMUNITY_API } from './community.api';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import {
    CreateCommentDto,
    CommentQueryDto,
    CommentResponseDto,
    PaginatedCommentsDto,
} from './community.dto';

@ApiTags('Community')
@Controller(COMMUNITY_API.BASE)
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    /**
     * POST /community/comments
     * Create a new comment
     */
    @Post('comments')
    @HttpCode(HttpStatus.CREATED)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Create comment',
        description: 'Create a new comment or reply to an existing comment.',
    })
    @ApiResponse({ status: 201, description: 'Comment created', type: CommentResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Blog or parent comment not found' })
    async createComment(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateCommentDto,
    ): Promise<{ data: CommentResponseDto }> {
        const result = await this.communityService.create(userId, dto);
        return { data: result };
    }

    /**
     * GET /community/comments/blog/:blogId
     * Get comments for a blog
     */
    @Get('comments/blog/:blogId')
    @HttpCode(HttpStatus.OK)
    @Public() // Bypass global strict guard
    @UseGuards(OptionalJwtAuthGuard) // Run optional guard to populate user if token exists
    @ApiOperation({
        summary: 'Get blog comments',
        description: 'Get threaded comments for a blog.',
    })
    @ApiResponse({ status: 200, description: 'Comments retrieved', type: PaginatedCommentsDto })
    async getBlogComments(
        @Param('blogId') blogId: string,
        @Query() query: CommentQueryDto,
        @CurrentUser('id') userId?: string,
    ): Promise<PaginatedCommentsDto> {
        return this.communityService.getBlogComments(blogId, query, userId);
    }

    /**
     * DELETE /community/comments/:id
     * Delete a comment
     */
    @Delete('comments/:id')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Delete comment',
        description: 'Delete your own comment.',
    })
    @ApiResponse({ status: 200, description: 'Comment deleted' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not authorized to delete this comment' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    async deleteComment(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.communityService.delete(id, userId);
        return { message: 'Comment deleted successfully' };
    }

    /**
     * POST /community/comments/:id/like
     * Like a comment
     */
    @Post('comments/:id/like')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Like comment',
        description: 'Like a specific comment.',
    })
    @ApiResponse({ status: 200, description: 'Comment liked' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 409, description: 'Already liked' })
    async likeComment(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.communityService.like(id, userId);
        return { message: 'Comment liked' };
    }

    /**
     * DELETE /community/comments/:id/like
     * Unlike a comment
     */
    @Delete('comments/:id/like')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Unlike comment',
        description: 'Remove like from a comment.',
    })
    @ApiResponse({ status: 200, description: 'Comment unliked' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Comment not found or not liked' })
    async unlikeComment(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.communityService.unlike(id, userId);
        return { message: 'Comment unliked' };
    }
}
