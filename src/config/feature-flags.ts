/**
 * Feature Flags Configuration
 * 
 * These flags control various features of the platform.
 * In production, these should be managed via database or a feature flag service.
 * For now, they are controlled via environment variables with sensible defaults.
 */

export interface FeatureFlags {
    // AI Features
    aiSummarization: boolean;
    aiSeoGeneration: boolean;
    aiAskBlog: boolean;
    aiEmbeddings: boolean;

    // User Features
    userRegistration: boolean;
    emailVerification: boolean;
    socialLogin: boolean;

    // Blog Features
    blogComments: boolean;
    blogLikes: boolean;
    blogBookmarks: boolean;
    exclusiveBlogs: boolean;

    // Payment Features
    tokenPurchase: boolean;
    creatorPayouts: boolean;

    // Platform Features
    exploreSection: boolean;
    notifications: boolean;
    analytics: boolean;

    // Maintenance
    maintenanceMode: boolean;
}

export const getFeatureFlags = (): FeatureFlags => ({
    // AI Features
    aiSummarization: process.env.FEATURE_AI_SUMMARIZATION !== 'false',
    aiSeoGeneration: process.env.FEATURE_AI_SEO !== 'false',
    aiAskBlog: process.env.FEATURE_AI_ASK !== 'false',
    aiEmbeddings: process.env.FEATURE_AI_EMBEDDINGS !== 'false',

    // User Features
    userRegistration: process.env.FEATURE_USER_REGISTRATION !== 'false',
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
    socialLogin: process.env.FEATURE_SOCIAL_LOGIN === 'true',

    // Blog Features
    blogComments: process.env.FEATURE_BLOG_COMMENTS !== 'false',
    blogLikes: process.env.FEATURE_BLOG_LIKES !== 'false',
    blogBookmarks: process.env.FEATURE_BLOG_BOOKMARKS !== 'false',
    exclusiveBlogs: process.env.FEATURE_EXCLUSIVE_BLOGS === 'true',

    // Payment Features
    tokenPurchase: process.env.FEATURE_TOKEN_PURCHASE === 'true',
    creatorPayouts: process.env.FEATURE_CREATOR_PAYOUTS === 'true',

    // Platform Features
    exploreSection: process.env.FEATURE_EXPLORE !== 'false',
    notifications: process.env.FEATURE_NOTIFICATIONS !== 'false',
    analytics: process.env.FEATURE_ANALYTICS !== 'false',

    // Maintenance
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
});

/**
 * Check if a specific feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    const flags = getFeatureFlags();
    return flags[feature];
};
