/**
 * AI API Contract
 * 
 * This file defines all AI-related endpoints.
 * Both frontend and backend MUST import from this file.
 */

export const AI_API = {
    // Base path for all AI routes
    BASE: 'ai',

    // Endpoints
    SUMMARIZE: {
        method: 'POST',
        path: '/ai/summarize',
        description: 'Generate AI summary for a blog',
    },

    GENERATE_SEO: {
        method: 'POST',
        path: '/ai/generate-seo',
        description: 'Generate SEO metadata for a blog',
    },

    SUGGEST_TAGS: {
        method: 'POST',
        path: '/ai/suggest-tags',
        description: 'Suggest tags based on content',
    },

    IMPROVE_CONTENT: {
        method: 'POST',
        path: '/ai/improve',
        description: 'Get AI suggestions to improve content',
    },

    ASK: {
        method: 'POST',
        path: '/ai/ask',
        description: 'Ask AI a question about a blog',
    },

    GENERATE_EXCERPT: {
        method: 'POST',
        path: '/ai/generate-excerpt',
        description: 'Generate excerpt from content',
    },
} as const;

export type AIEndpoint = keyof typeof AI_API;
