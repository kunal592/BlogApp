import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AIService } from './ai.service';
import { AI_API } from './ai.api';
import {
    SummarizeDto,
    ContentDto,
    AskAIDto,
    SummaryResponseDto,
    SEOResponseDto,
    TagSuggestionsDto,
    ImprovementSuggestionsDto,
    AskAIResponseDto,
    ExcerptResponseDto,
} from './ai.dto';

@ApiTags('AI')
@Controller(AI_API.BASE)
export class AIController {
    constructor(private readonly aiService: AIService) { }

    /**
     * POST /ai/summarize
     * Generate summary for a blog
     */
    @Post('summarize')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Summarize blog',
        description: 'Generate AI summary for a blog post.',
    })
    @ApiResponse({ status: 200, description: 'Summary generated', type: SummaryResponseDto })
    @ApiResponse({ status: 400, description: 'AI not available or failed' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async summarize(@Body() dto: SummarizeDto): Promise<{ data: SummaryResponseDto }> {
        const result = await this.aiService.summarize(dto);
        return { data: result };
    }

    /**
     * POST /ai/generate-seo
     * Generate SEO metadata
     */
    @Post('generate-seo')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Generate SEO metadata',
        description: 'Generate SEO-optimized title, description, and keywords.',
    })
    @ApiResponse({ status: 200, description: 'SEO generated', type: SEOResponseDto })
    @ApiResponse({ status: 400, description: 'AI not available or failed' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async generateSEO(@Body() dto: ContentDto): Promise<{ data: SEOResponseDto }> {
        const result = await this.aiService.generateSEO(dto);
        return { data: result };
    }

    /**
     * POST /ai/suggest-tags
     * Suggest tags for content
     */
    @Post('suggest-tags')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Suggest tags',
        description: 'Get AI-suggested tags based on content.',
    })
    @ApiResponse({ status: 200, description: 'Tags suggested', type: TagSuggestionsDto })
    @ApiResponse({ status: 400, description: 'AI not available or failed' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async suggestTags(@Body() dto: ContentDto): Promise<{ data: TagSuggestionsDto }> {
        const result = await this.aiService.suggestTags(dto);
        return { data: result };
    }

    /**
     * POST /ai/improve
     * Get content improvement suggestions
     */
    @Post('improve')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Improve content',
        description: 'Get AI suggestions to improve blog content.',
    })
    @ApiResponse({ status: 200, description: 'Suggestions generated', type: ImprovementSuggestionsDto })
    @ApiResponse({ status: 400, description: 'AI not available or failed' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async improveContent(@Body() dto: ContentDto): Promise<{ data: ImprovementSuggestionsDto }> {
        const result = await this.aiService.improveContent(dto);
        return { data: result };
    }

    /**
     * POST /ai/ask
     * Ask AI about a blog
     */
    @Post('ask')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Ask AI about blog',
        description: 'Ask questions about a specific blog and get AI answers.',
    })
    @ApiResponse({ status: 200, description: 'Question answered', type: AskAIResponseDto })
    @ApiResponse({ status: 400, description: 'AI not available or failed' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Blog not found' })
    async askAboutBlog(@Body() dto: AskAIDto): Promise<{ data: AskAIResponseDto }> {
        const result = await this.aiService.askAboutBlog(dto);
        return { data: result };
    }

    /**
     * POST /ai/generate-excerpt
     * Generate excerpt from content
     */
    @Post('generate-excerpt')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Generate excerpt',
        description: 'Generate a compelling excerpt from blog content.',
    })
    @ApiResponse({ status: 200, description: 'Excerpt generated', type: ExcerptResponseDto })
    @ApiResponse({ status: 400, description: 'AI not available or failed' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async generateExcerpt(@Body() dto: ContentDto): Promise<{ data: ExcerptResponseDto }> {
        const result = await this.aiService.generateExcerpt(dto);
        return { data: result };
    }
}
