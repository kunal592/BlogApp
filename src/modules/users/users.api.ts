/**
 * Users API Contract
 * 
 * This file defines all user-related endpoints.
 * Both frontend and backend MUST import from this file.
 * This prevents endpoint mismatch issues.
 */

export const USERS_API = {
    // Base path for all user routes
    BASE: 'users',

    // Endpoints
    GET_PROFILE: {
        method: 'GET',
        path: '/users/profile',
        description: 'Get current user profile (authenticated)',
    },

    UPDATE_PROFILE: {
        method: 'PATCH',
        path: '/users/profile',
        description: 'Update current user profile',
    },

    GET_PUBLIC_PROFILE: {
        method: 'GET',
        path: '/users/:username',
        description: 'Get public user profile by username',
    },

    FOLLOW: {
        method: 'POST',
        path: '/users/:userId/follow',
        description: 'Follow a user',
    },

    UNFOLLOW: {
        method: 'DELETE',
        path: '/users/:userId/follow',
        description: 'Unfollow a user',
    },

    GET_FOLLOWERS: {
        method: 'GET',
        path: '/users/:userId/followers',
        description: 'Get list of followers',
    },

    GET_FOLLOWING: {
        method: 'GET',
        path: '/users/:userId/following',
        description: 'Get list of users being followed',
    },

    CHECK_FOLLOW_STATUS: {
        method: 'GET',
        path: '/users/:userId/follow-status',
        description: 'Check if current user follows target user',
    },

    UPGRADE_TO_CREATOR: {
        method: 'POST',
        path: '/users/upgrade-to-creator',
        description: 'Upgrade current user to creator role',
    },
} as const;

export type UsersEndpoint = keyof typeof USERS_API;
