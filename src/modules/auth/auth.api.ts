/**
 * Auth API Contract
 * 
 * This file defines all auth-related endpoints.
 * Both frontend and backend MUST import from this file.
 * This prevents endpoint mismatch issues.
 */

export const AUTH_API = {
    // Base path for all auth routes
    BASE: 'auth',

    // Endpoints
    REGISTER: {
        method: 'POST',
        path: '/auth/register',
        description: 'Register a new user',
    },

    LOGIN: {
        method: 'POST',
        path: '/auth/login',
        description: 'Login with email and password',
    },

    LOGOUT: {
        method: 'POST',
        path: '/auth/logout',
        description: 'Logout current user (clears cookie)',
    },

    ME: {
        method: 'GET',
        path: '/auth/me',
        description: 'Get current authenticated user',
    },

    REFRESH: {
        method: 'POST',
        path: '/auth/refresh',
        description: 'Refresh access token',
    },
} as const;

// Type for API endpoint keys
export type AuthEndpoint = keyof typeof AUTH_API;
