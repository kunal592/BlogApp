import {
    Controller,
    Get,
    Query,
    Param,
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
import { ExploreService } from './explore.service';
import { EXPLORE_API } from './explore.api';
import {
    SearchQueryDto,
    FeedQueryDto,
    SearchResultsDto,
    PaginatedFeedDto,
    PaginatedTagsDto,
    PaginatedCreatorsDto,
} from './explore.dto';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Explore')
@Controller(EXPLORE_API.BASE)
export class ExploreController {
    constructor(private readonly exploreService: ExploreService) { }

    /**
     * GET /explore/search
     * Search blogs and users
     */
    @Public()
    @Get('search')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Search blogs and users',
        description: 'Search across blogs and users. Can filter by type.',
    })
    @ApiResponse({ status: 200, description: 'Search results', type: SearchResultsDto })
    async search(
        @Query() query: SearchQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<SearchResultsDto> {
        return this.exploreService.search(query, currentUserId);
    }

    /**
     * GET /explore/trending
     * Get trending blogs
     */
    @Public()
    @Get('trending')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get trending blogs',
        description: 'Get blogs trending by likes, views, and engagement. Filterable by time period.',
    })
    @ApiResponse({ status: 200, description: 'Trending blogs', type: PaginatedFeedDto })
    async getTrending(
        @Query() query: FeedQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedFeedDto> {
        return this.exploreService.getTrending(query, currentUserId);
    }

    /**
     * GET /explore/for-you
     * Get personalized recommendations
     */
    @Get('for-you')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get personalized feed',
        description: 'Personalized blog recommendations based on follows, likes, and interests.',
    })
    @ApiResponse({ status: 200, description: 'Personalized feed', type: PaginatedFeedDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getForYou(
        @CurrentUser('id') userId: string,
        @Query() query: FeedQueryDto,
    ): Promise<PaginatedFeedDto> {
        return this.exploreService.getForYou(userId, query);
    }

    /**
     * GET /explore/tags
     * Get popular tags
     */
    @Public()
    @Get('tags')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get popular tags',
        description: 'Get tags ordered by blog count.',
    })
    @ApiResponse({ status: 200, description: 'Popular tags', type: PaginatedTagsDto })
    async getPopularTags(@Query() query: FeedQueryDto): Promise<PaginatedTagsDto> {
        return this.exploreService.getPopularTags(query);
    }

    /**
     * GET /explore/tags/:slug
     * Get blogs by tag
     */
    @Public()
    @Get('tags/:slug')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get blogs by tag',
        description: 'Get all published blogs with a specific tag.',
    })
    @ApiParam({ name: 'slug', description: 'Tag slug' })
    @ApiResponse({ status: 200, description: 'Blogs with tag', type: PaginatedFeedDto })
    async getBlogsByTag(
        @Param('slug') slug: string,
        @Query() query: FeedQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedFeedDto> {
        return this.exploreService.getBlogsByTag(slug, query, currentUserId);
    }

    /**
     * GET /explore/creators
     * Get top creators
     */
    @Public()
    @Get('creators')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get top creators',
        description: 'Get creators ordered by follower count.',
    })
    @ApiResponse({ status: 200, description: 'Top creators', type: PaginatedCreatorsDto })
    async getTopCreators(
        @Query() query: FeedQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedCreatorsDto> {
        return this.exploreService.getTopCreators(query, currentUserId);
    }

    /**
     * GET /explore/recent
     * Get recent blogs
     */
    @Public()
    @Get('recent')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get recent blogs',
        description: 'Get most recently published blogs.',
    })
    @ApiResponse({ status: 200, description: 'Recent blogs', type: PaginatedFeedDto })
    async getRecent(
        @Query() query: FeedQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedFeedDto> {
        return this.exploreService.getRecent(query, currentUserId);
    }
}
