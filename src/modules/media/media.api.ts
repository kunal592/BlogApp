/**
 * Media API Contract
 * 
 * This file defines all media-related endpoints.
 * Both frontend and backend MUST import from this file.
 */

export const MEDIA_API = {
    // Base path for all media routes
    BASE: 'media',

    // Endpoints
    UPLOAD: {
        method: 'POST',
        path: '/media/upload',
        description: 'Upload a single file',
    },

    UPLOAD_MULTIPLE: {
        method: 'POST',
        path: '/media/upload-multiple',
        description: 'Upload multiple files',
    },

    GET_BY_ID: {
        method: 'GET',
        path: '/media/:id',
        description: 'Get media by ID',
    },

    GET_MY_MEDIA: {
        method: 'GET',
        path: '/media/my',
        description: 'Get all media uploaded by current user',
    },

    DELETE: {
        method: 'DELETE',
        path: '/media/:id',
        description: 'Delete a media file',
    },

    GET_SIGNED_URL: {
        method: 'POST',
        path: '/media/signed-url',
        description: 'Get a presigned upload URL for direct browser upload',
    },
} as const;

export type MediaEndpoint = keyof typeof MEDIA_API;
