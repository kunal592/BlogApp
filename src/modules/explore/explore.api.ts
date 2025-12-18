/**
 * Explore API Contract
 * 
 * This file defines all explore/discovery-related endpoints.
 * Both frontend and backend MUST import from this file.
 */

export const EXPLORE_API = {
    // Base path for all explore routes
    BASE: 'explore',

    // Endpoints
    SEARCH: {
        method: 'GET',
        path: '/explore/search',
        description: 'Search blogs and users',
    },

    TRENDING: {
        method: 'GET',
        path: '/explore/trending',
        description: 'Get trending blogs',
    },

    FOR_YOU: {
        method: 'GET',
        path: '/explore/for-you',
        description: 'Personalized recommendations',
    },

    POPULAR_TAGS: {
        method: 'GET',
        path: '/explore/tags',
        description: 'Get popular tags',
    },

    TAG_BLOGS: {
        method: 'GET',
        path: '/explore/tags/:slug',
        description: 'Get blogs by tag',
    },

    TOP_CREATORS: {
        method: 'GET',
        path: '/explore/creators',
        description: 'Get top creators',
    },

    RECENT: {
        method: 'GET',
        path: '/explore/recent',
        description: 'Get recent blogs',
    },
} as const;

export type ExploreEndpoint = keyof typeof EXPLORE_API;
