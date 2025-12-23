import { api } from '@/lib/api-client';

export interface SummaryResponse {
    summary: string;
    keyPoints: string[];
}

export interface SEOResponse {
    title: string;
    description: string;
    keywords: string[];
}

export interface TagSuggestion {
    name: string;
    confidence: number;
}

export interface ImprovementSuggestion {
    type: 'grammar' | 'style' | 'structure' | 'engagement';
    suggestion: string;
    originalText?: string;
    improvedText?: string;
}

export interface AskAIResponse {
    answer: string;
    citations?: { paragraph: number; text: string }[];
}

export interface ExcerptResponse {
    excerpt: string;
}

export const aiService = {
    async summarize(blogId: string): Promise<SummaryResponse> {
        const response = await api.post<{ data: SummaryResponse }>('/ai/summarize', { blogId });
        return response.data;
    },

    async generateSEO(title: string, content: string): Promise<SEOResponse> {
        const response = await api.post<{ data: SEOResponse }>('/ai/generate-seo', { title, content });
        return response.data;
    },

    async suggestTags(title: string, content: string): Promise<TagSuggestion[]> {
        const response = await api.post<{ data: { tags: TagSuggestion[] } }>('/ai/suggest-tags', { title, content });
        return response.data.tags;
    },

    async improve(title: string, content: string): Promise<ImprovementSuggestion[]> {
        const response = await api.post<{ data: { suggestions: ImprovementSuggestion[] } }>('/ai/improve', { title, content });
        return response.data.suggestions;
    },

    async ask(blogId: string, question: string): Promise<AskAIResponse> {
        const response = await api.post<{ data: AskAIResponse }>('/ai/ask', { blogId, question });
        return response.data;
    },

    async generateExcerpt(title: string, content: string): Promise<string> {
        const response = await api.post<{ data: ExcerptResponse }>('/ai/generate-excerpt', { title, content });
        return response.data.excerpt;
    },
};
