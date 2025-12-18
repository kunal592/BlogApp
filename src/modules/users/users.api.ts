/**
 * Users API Contract
 * 
 * This file defines all user-related endpoints.
 * Both frontend and backend MUST import from this file.
 */

export const USERS_API = {
    // Base path for all user routes
    BASE: 'users',

    // Endpoints
    GET_PROFILE: {
        method: 'GET',
        path: '/users/:id',
        description: 'Get user profile by ID',
    },

    UPDATE_PROFILE: {
        method: 'PATCH',
        path: '/users/:id',
        description: 'Update user profile',
    },

    DEACTIVATE: {
        method: 'DELETE',
        path: '/users/:id',
        description: 'Soft delete (deactivate) user account',
    },

    LIST: {
        method: 'GET',
        path: '/users',
        description: 'List users (admin only)',
    },
} as const;

export type UsersEndpoint = keyof typeof USERS_API;
