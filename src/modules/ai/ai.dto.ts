import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for summarization request
 */
export class SummarizeDto {
    @ApiProperty({
        example: 'clxxxxxxxxxxxxxxxxxx',
        description: 'Blog ID to summarize',
    })
    @IsString()
    blogId!: string;

    @ApiPropertyOptional({
        example: 200,
        description: 'Max words for summary',
    })
    @IsOptional()
    maxWords?: number;
}

/**
 * DTO for content-based operations
 */
export class ContentDto {
    @ApiProperty({
        example: 'This is the blog content to process...',
        description: 'Blog content (markdown)',
        minLength: 50,
        maxLength: 50000,
    })
    @IsString()
    @MinLength(50)
    @MaxLength(50000)
    content!: string;

    @ApiPropertyOptional({
        example: 'How to Build Modern APIs',
        description: 'Blog title for context',
    })
    @IsOptional()
    @IsString()
    title?: string;
}

/**
 * DTO for Ask AI request
 */
export class AskAIDto {
    @ApiProperty({
        example: 'clxxxxxxxxxxxxxxxxxx',
        description: 'Blog ID to ask about',
    })
    @IsString()
    blogId!: string;

    @ApiProperty({
        example: 'What are the main points discussed in this article?',
        description: 'Question to ask',
        minLength: 5,
        maxLength: 500,
    })
    @IsString()
    @MinLength(5)
    @MaxLength(500)
    question!: string;
}

/**
 * Response for summary
 */
export class SummaryResponseDto {
    @ApiProperty({
        example: 'This article discusses the best practices for building modern APIs...',
    })
    summary!: string;

    @ApiProperty({ example: 150 })
    wordCount!: number;
}

/**
 * Response for SEO generation
 */
export class SEOResponseDto {
    @ApiProperty({ example: 'How to Build Modern REST APIs | Complete Guide 2024' })
    metaTitle!: string;

    @ApiProperty({
        example: 'Learn how to build scalable REST APIs with best practices, authentication, and error handling.',
    })
    metaDescription!: string;

    @ApiProperty({
        example: 'REST API, API development, backend, Node.js, best practices',
    })
    metaKeywords!: string;

    @ApiPropertyOptional({
        example: 'how-to-build-modern-rest-apis',
        description: 'Suggested slug',
    })
    suggestedSlug?: string;
}

/**
 * Response for tag suggestions
 */
export class TagSuggestionsDto {
    @ApiProperty({
        type: [String],
        example: ['JavaScript', 'Node.js', 'API', 'Backend', 'REST'],
    })
    tags!: string[];

    @ApiProperty({
        type: [String],
        example: ['Consider adding more specific framework tags like Express or NestJS'],
    })
    suggestions!: string[];
}

/**
 * Response for content improvement
 */
export class ImprovementSuggestionsDto {
    @ApiProperty({
        type: [String],
        example: [
            'Add more code examples to illustrate concepts',
            'Consider breaking down the authentication section into smaller parts',
            'Add a table of contents for easier navigation',
        ],
    })
    suggestions!: string[];

    @ApiProperty({
        example: 8,
        description: 'Readability score (1-10)',
    })
    readabilityScore!: number;

    @ApiPropertyOptional({
        example: 'The content is well-structured but could benefit from more examples.',
    })
    overallFeedback?: string;
}

/**
 * Response for Ask AI
 */
export class AskAIResponseDto {
    @ApiProperty({
        example: 'Based on the article, the main points are: 1) Authentication is crucial...',
    })
    answer!: string;

    @ApiPropertyOptional({
        type: [String],
        example: ['What is the difference between JWT and session authentication?'],
    })
    relatedQuestions?: string[];
}

/**
 * Response for excerpt generation
 */
export class ExcerptResponseDto {
    @ApiProperty({
        example: 'Learn how to build scalable REST APIs with Node.js and Express, covering authentication, error handling, and best practices.',
        maxLength: 300,
    })
    excerpt!: string;
}
