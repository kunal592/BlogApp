/**
 * Blogs API Contract
 * 
 * This file defines all blog-related endpoints.
 * Both frontend and backend MUST import from this file.
 */

export const BLOGS_API = {
    // Base path for all blog routes
    BASE: 'blogs',

    // Endpoints
    CREATE: {
        method: 'POST',
        path: '/blogs',
        description: 'Create a new blog (draft)',
    },

    GET_ALL: {
        method: 'GET',
        path: '/blogs',
        description: 'Get published blogs (public feed)',
    },

    GET_MY_BLOGS: {
        method: 'GET',
        path: '/blogs/my',
        description: 'Get all blogs by current user (including drafts)',
    },

    GET_BY_SLUG: {
        method: 'GET',
        path: '/blogs/:slug',
        description: 'Get a single blog by slug',
    },

    UPDATE: {
        method: 'PATCH',
        path: '/blogs/:id',
        description: 'Update a blog',
    },

    DELETE: {
        method: 'DELETE',
        path: '/blogs/:id',
        description: 'Soft delete a blog',
    },

    PUBLISH: {
        method: 'POST',
        path: '/blogs/:id/publish',
        description: 'Publish a draft blog',
    },

    UNPUBLISH: {
        method: 'POST',
        path: '/blogs/:id/unpublish',
        description: 'Unpublish (archive) a blog',
    },

    LIKE: {
        method: 'POST',
        path: '/blogs/:id/like',
        description: 'Like a blog',
    },

    UNLIKE: {
        method: 'DELETE',
        path: '/blogs/:id/like',
        description: 'Unlike a blog',
    },

    BOOKMARK: {
        method: 'POST',
        path: '/blogs/:id/bookmark',
        description: 'Bookmark a blog',
    },

    UNBOOKMARK: {
        method: 'DELETE',
        path: '/blogs/:id/bookmark',
        description: 'Remove bookmark from a blog',
    },

    GET_BOOKMARKS: {
        method: 'GET',
        path: '/blogs/bookmarks',
        description: 'Get user bookmarked blogs',
    },

    GET_BY_AUTHOR: {
        method: 'GET',
        path: '/blogs/author/:username',
        description: 'Get published blogs by author username',
    },

    GET_BY_TAG: {
        method: 'GET',
        path: '/blogs/tag/:slug',
        description: 'Get blogs by tag',
    },

    INCREMENT_VIEW: {
        method: 'POST',
        path: '/blogs/:id/view',
        description: 'Increment view count',
    },
} as const;

export type BlogsEndpoint = keyof typeof BLOGS_API;
