/**
 * Community API Contract
 * 
 * This file defines all community-related endpoints (comments, discussions).
 * Both frontend and backend MUST import from this file.
 */

export const COMMUNITY_API = {
    // Base path for all community routes
    BASE: 'community',

    // Endpoints
    CREATE_COMMENT: {
        method: 'POST',
        path: '/community/comments',
        description: 'Create a new comment or reply',
    },

    GET_BLOG_COMMENTS: {
        method: 'GET',
        path: '/community/comments/blog/:blogId',
        description: 'Get comments for a specific blog',
    },

    DELETE_COMMENT: {
        method: 'DELETE',
        path: '/community/comments/:id',
        description: 'Delete a comment',
    },

    LIKE_COMMENT: {
        method: 'POST',
        path: '/community/comments/:id/like',
        description: 'Like a comment',
    },

    UNLIKE_COMMENT: {
        method: 'DELETE',
        path: '/community/comments/:id/like',
        description: 'Unlike a comment',
    },

    GET_MY_COMMENTS: {
        method: 'GET',
        path: '/community/comments/my',
        description: 'Get comments by current user',
    },
} as const;

export type CommunityEndpoint = keyof typeof COMMUNITY_API;
