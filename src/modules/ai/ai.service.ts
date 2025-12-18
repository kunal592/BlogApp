import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { PrismaService } from '../../prisma/prisma.service';
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

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);
    private readonly genAI: GoogleGenerativeAI | null;
    private readonly model: GenerativeModel | null;
    private readonly isEnabled: boolean;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('ai.geminiApiKey');
        const modelName = this.configService.get<string>('ai.geminiModel') || 'gemini-pro';

        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: modelName });
            this.isEnabled = true;
            this.logger.log('AI Service initialized with Gemini');
        } else {
            this.genAI = null;
            this.model = null;
            this.isEnabled = false;
            this.logger.warn('AI Service disabled - No Gemini API key configured');
        }
    }

    /**
     * Check if AI is available
     */
    private checkAvailability(): void {
        if (!this.isEnabled || !this.model) {
            throw new BadRequestException('AI features are not available. Please configure GEMINI_API_KEY.');
        }
    }

    /**
     * Generate summary for a blog
     */
    async summarize(dto: SummarizeDto): Promise<SummaryResponseDto> {
        this.checkAvailability();

        const blog = await this.prisma.blog.findUnique({
            where: { id: dto.blogId },
            select: { title: true, content: true },
        });

        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        const maxWords = dto.maxWords || 200;

        const prompt = `You are a professional content summarizer. Summarize the following blog post in approximately ${maxWords} words. 
Be concise but capture the key points. Do not include any preamble like "Here's a summary" - just provide the summary directly.

Title: ${blog.title}

Content:
${blog.content}`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = result.response;
            const summary = response.text();

            // Count words
            const wordCount = summary.split(/\s+/).length;

            // Update blog with summary
            await this.prisma.blog.update({
                where: { id: dto.blogId },
                data: { summary },
            });

            this.logger.log(`Generated summary for blog ${dto.blogId}`);

            return {
                summary,
                wordCount,
            };
        } catch (error) {
            this.logger.error('Failed to generate summary', error);
            throw new BadRequestException('Failed to generate summary. Please try again.');
        }
    }

    /**
     * Generate SEO metadata
     */
    async generateSEO(dto: ContentDto): Promise<SEOResponseDto> {
        this.checkAvailability();

        const prompt = `You are an SEO expert. Generate SEO metadata for the following blog content.
Respond in JSON format with the following structure:
{
  "metaTitle": "SEO-optimized title (max 60 chars)",
  "metaDescription": "Compelling meta description (max 160 chars)",
  "metaKeywords": "comma-separated keywords (5-8 keywords)",
  "suggestedSlug": "url-friendly-slug"
}

Title: ${dto.title || 'Untitled'}

Content:
${dto.content.substring(0, 5000)}`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }

            const seoData = JSON.parse(jsonMatch[0]);

            this.logger.log('Generated SEO metadata');

            return {
                metaTitle: seoData.metaTitle || '',
                metaDescription: seoData.metaDescription || '',
                metaKeywords: seoData.metaKeywords || '',
                suggestedSlug: seoData.suggestedSlug,
            };
        } catch (error) {
            this.logger.error('Failed to generate SEO', error);
            throw new BadRequestException('Failed to generate SEO metadata. Please try again.');
        }
    }

    /**
     * Suggest tags for content
     */
    async suggestTags(dto: ContentDto): Promise<TagSuggestionsDto> {
        this.checkAvailability();

        const prompt = `You are a content categorization expert. Suggest relevant tags for the following blog content.
Respond in JSON format with the following structure:
{
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "suggestions": ["Optional suggestion about tagging strategy"]
}

Provide 5-8 relevant tags that would help readers discover this content.

Title: ${dto.title || 'Untitled'}

Content:
${dto.content.substring(0, 5000)}`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }

            const tagData = JSON.parse(jsonMatch[0]);

            this.logger.log('Generated tag suggestions');

            return {
                tags: tagData.tags || [],
                suggestions: tagData.suggestions || [],
            };
        } catch (error) {
            this.logger.error('Failed to suggest tags', error);
            throw new BadRequestException('Failed to suggest tags. Please try again.');
        }
    }

    /**
     * Get content improvement suggestions
     */
    async improveContent(dto: ContentDto): Promise<ImprovementSuggestionsDto> {
        this.checkAvailability();

        const prompt = `You are an expert content editor. Analyze the following blog content and provide improvement suggestions.
Respond in JSON format with the following structure:
{
  "suggestions": [
    "Specific, actionable suggestion 1",
    "Specific, actionable suggestion 2",
    "Specific, actionable suggestion 3"
  ],
  "readabilityScore": 7,
  "overallFeedback": "Brief overall assessment"
}

Provide 3-5 specific, actionable suggestions. Rate readability from 1-10.

Title: ${dto.title || 'Untitled'}

Content:
${dto.content.substring(0, 8000)}`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid response format');
            }

            const improvementData = JSON.parse(jsonMatch[0]);

            this.logger.log('Generated content improvement suggestions');

            return {
                suggestions: improvementData.suggestions || [],
                readabilityScore: improvementData.readabilityScore || 5,
                overallFeedback: improvementData.overallFeedback,
            };
        } catch (error) {
            this.logger.error('Failed to generate improvements', error);
            throw new BadRequestException('Failed to analyze content. Please try again.');
        }
    }

    /**
     * Answer questions about a blog
     */
    async askAboutBlog(dto: AskAIDto): Promise<AskAIResponseDto> {
        this.checkAvailability();

        const blog = await this.prisma.blog.findUnique({
            where: { id: dto.blogId },
            select: { title: true, content: true },
        });

        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        const prompt = `You are a helpful assistant that answers questions about blog content.
Answer the user's question based ONLY on the following blog content. If the answer is not in the content, say so.

Blog Title: ${blog.title}

Blog Content:
${blog.content.substring(0, 10000)}

User Question: ${dto.question}

Respond in JSON format:
{
  "answer": "Your detailed answer here",
  "relatedQuestions": ["Related question 1", "Related question 2"]
}`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                // If JSON parsing fails, return raw answer
                return {
                    answer: text,
                    relatedQuestions: [],
                };
            }

            const askData = JSON.parse(jsonMatch[0]);

            this.logger.log(`Answered question about blog ${dto.blogId}`);

            return {
                answer: askData.answer || text,
                relatedQuestions: askData.relatedQuestions || [],
            };
        } catch (error) {
            this.logger.error('Failed to answer question', error);
            throw new BadRequestException('Failed to process question. Please try again.');
        }
    }

    /**
     * Generate excerpt from content
     */
    async generateExcerpt(dto: ContentDto): Promise<ExcerptResponseDto> {
        this.checkAvailability();

        const prompt = `You are a professional content writer. Generate a compelling excerpt/teaser for the following blog content.
The excerpt should:
- Be 150-200 characters
- Hook the reader
- Summarize the main value proposition
- Not include any quotation marks

Respond with ONLY the excerpt text, nothing else.

Title: ${dto.title || 'Untitled'}

Content:
${dto.content.substring(0, 3000)}`;

        try {
            const result = await this.model!.generateContent(prompt);
            const response = result.response;
            const excerpt = response.text().trim().replace(/^["']|["']$/g, '');

            this.logger.log('Generated excerpt');

            return {
                excerpt: excerpt.substring(0, 300),
            };
        } catch (error) {
            this.logger.error('Failed to generate excerpt', error);
            throw new BadRequestException('Failed to generate excerpt. Please try again.');
        }
    }

    /**
     * Update blog with AI-generated summary
     */
    async updateBlogSummary(blogId: string): Promise<void> {
        if (!this.isEnabled) {
            return;
        }

        try {
            const result = await this.summarize({ blogId, maxWords: 150 });
            this.logger.log(`Auto-updated summary for blog ${blogId}`);
        } catch (error) {
            this.logger.warn(`Failed to auto-update summary for blog ${blogId}`);
        }
    }
}
