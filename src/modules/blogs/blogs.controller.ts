import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiCookieAuth,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { BLOGS_API } from './blogs.api';
import {
    CreateBlogDto,
    UpdateBlogDto,
    BlogQueryDto,
    MyBlogsQueryDto,
    BlogResponseDto,
    PaginatedBlogsDto,
} from './blogs.dto';
import { CurrentUser, Public, Roles } from '../../common/decorators';

@ApiTags('Blogs')
@Controller(BLOGS_API.BASE)
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) { }

    /**
     * POST /blogs
     * Create a new blog (draft)
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Roles('CREATOR', 'ADMIN', 'OWNER')
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Create a new blog',
        description: 'Create a new blog as a draft. Only creators can create blogs.',
    })
    @ApiResponse({ status: 201, description: 'Blog created', type: BlogResponseDto })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not a creator' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateBlogDto,
    ): Promise<{ data: BlogResponseDto; message: string }> {
        const blog = await this.blogsService.create(userId, dto);
        return {
            data: blog,
            message: 'Blog created successfully',
        };
    }

    /**
     * GET /blogs
     * Get published blogs (public feed)
     */
    @Public()
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get published blogs',
        description: 'Get paginated list of published blogs. Supports search and sorting.',
    })
    @ApiResponse({ status: 200, description: 'Blogs retrieved', type: PaginatedBlogsDto })
    async findAll(
        @Query() query: BlogQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedBlogsDto> {
        return this.blogsService.findAll(query, currentUserId);
    }

    /**
     * GET /blogs/my
     * Get current user's blogs (including drafts)
     */
    @Get('my')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get my blogs',
        description: 'Get all blogs created by current user, including drafts and archived.',
    })
    @ApiResponse({ status: 200, description: 'Blogs retrieved', type: PaginatedBlogsDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async findMyBlogs(
        @CurrentUser('id') userId: string,
        @Query() query: MyBlogsQueryDto,
    ): Promise<PaginatedBlogsDto> {
        return this.blogsService.findMyBlogs(userId, query);
    }

    /**
     * GET /blogs/bookmarks
     * Get user's bookmarked blogs
     */
    @Get('bookmarks')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get bookmarked blogs',
        description: 'Get all blogs bookmarked by current user.',
    })
    @ApiResponse({ status: 200, description: 'Bookmarks retrieved', type: PaginatedBlogsDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getBookmarks(
        @CurrentUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<PaginatedBlogsDto> {
        return this.blogsService.getBookmarks(userId, page, limit);
    }

    /**
     * GET /blogs/author/:username
     * Get published blogs by author
     */
    @Public()
    @Get('author/:username')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get blogs by author',
        description: 'Get published blogs by a specific author.',
    })
    @ApiParam({ name: 'username', description: 'Author username' })
    @ApiResponse({ status: 200, description: 'Blogs retrieved', type: PaginatedBlogsDto })
    @ApiResponse({ status: 404, description: 'Author not found' })
    async findByAuthor(
        @Param('username') username: string,
        @Query() query: BlogQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedBlogsDto> {
        return this.blogsService.findByAuthor(username, query, currentUserId);
    }

    /**
     * GET /blogs/:slug
     * Get a single blog by slug
     */
    @Public()
    @Get(':slug')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get blog by slug',
        description: 'Get a single blog by its URL slug.',
    })
    @ApiParam({ name: 'slug', description: 'Blog URL slug' })
    @ApiResponse({ status: 200, description: 'Blog retrieved', type: BlogResponseDto })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async findBySlug(
        @Param('slug') slug: string,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<{ data: BlogResponseDto }> {
        const blog = await this.blogsService.findBySlug(slug, currentUserId);
        return { data: blog };
    }

    /**
     * PATCH /blogs/:id
     * Update a blog
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Update a blog',
        description: 'Update blog content. Only the author can update.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Blog updated', type: BlogResponseDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not the author' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateBlogDto,
    ): Promise<{ data: BlogResponseDto; message: string }> {
        const blog = await this.blogsService.update(id, userId, dto);
        return {
            data: blog,
            message: 'Blog updated successfully',
        };
    }

    /**
     * DELETE /blogs/:id
     * Soft delete a blog
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Delete a blog',
        description: 'Soft delete a blog. Only the author can delete.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Blog deleted' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not the author' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.blogsService.delete(id, userId);
        return { message: 'Blog deleted successfully' };
    }

    /**
     * POST /blogs/:id/publish
     * Publish a draft blog
     */
    @Post(':id/publish')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Publish a blog',
        description: 'Publish a draft blog. Only the author can publish.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Blog published', type: BlogResponseDto })
    @ApiResponse({ status: 400, description: 'Already published' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not the author' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async publish(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ data: BlogResponseDto; message: string }> {
        const blog = await this.blogsService.publish(id, userId);
        return {
            data: blog,
            message: 'Blog published successfully',
        };
    }

    /**
     * POST /blogs/:id/unpublish
     * Unpublish (archive) a blog
     */
    @Post(':id/unpublish')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Unpublish a blog',
        description: 'Archive a published blog. Only the author can unpublish.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Blog unpublished', type: BlogResponseDto })
    @ApiResponse({ status: 400, description: 'Not published' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 403, description: 'Not the author' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async unpublish(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ data: BlogResponseDto; message: string }> {
        const blog = await this.blogsService.unpublish(id, userId);
        return {
            data: blog,
            message: 'Blog unpublished successfully',
        };
    }

    /**
     * POST /blogs/:id/like
     * Like a blog
     */
    @Post(':id/like')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Like a blog',
        description: 'Add a like to a published blog.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Blog liked' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    @ApiResponse({ status: 409, description: 'Already liked' })
    async like(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.blogsService.like(id, userId);
        return { message: 'Blog liked successfully' };
    }

    /**
     * DELETE /blogs/:id/like
     * Unlike a blog
     */
    @Delete(':id/like')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Unlike a blog',
        description: 'Remove like from a blog.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Blog unliked' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Not liked' })
    async unlike(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.blogsService.unlike(id, userId);
        return { message: 'Blog unliked successfully' };
    }

    /**
     * POST /blogs/:id/bookmark
     * Bookmark a blog
     */
    @Post(':id/bookmark')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Bookmark a blog',
        description: 'Add a blog to bookmarks.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Blog bookmarked' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    @ApiResponse({ status: 409, description: 'Already bookmarked' })
    async bookmark(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.blogsService.bookmark(id, userId);
        return { message: 'Blog bookmarked successfully' };
    }

    /**
     * DELETE /blogs/:id/bookmark
     * Remove bookmark
     */
    @Delete(':id/bookmark')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Remove bookmark',
        description: 'Remove a blog from bookmarks.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'Bookmark removed' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Not bookmarked' })
    async unbookmark(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.blogsService.unbookmark(id, userId);
        return { message: 'Bookmark removed successfully' };
    }

    /**
     * POST /blogs/:id/view
     * Increment view count
     */
    @Public()
    @Post(':id/view')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Increment view count',
        description: 'Track a view on a blog. Should be called when blog is viewed.',
    })
    @ApiParam({ name: 'id', description: 'Blog ID' })
    @ApiResponse({ status: 200, description: 'View recorded' })
    async incrementView(@Param('id') id: string): Promise<{ message: string }> {
        await this.blogsService.incrementView(id);
        return { message: 'View recorded' };
    }
}
