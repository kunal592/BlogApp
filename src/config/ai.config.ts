import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
    provider: 'gemini',

    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-pro',
        embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'embedding-001',
    },

    // RAG settings
    rag: {
        chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '1000', 10),
        chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '200', 10),
        topK: parseInt(process.env.RAG_TOP_K || '5', 10),
    },

    // Feature toggles (controlled by feature flags)
    features: {
        summarization: true,
        seoGeneration: true,
        askAi: true,
    },
}));
