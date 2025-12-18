/**
 * API Response Messages
 */
export const MESSAGES = {
    // Auth
    AUTH: {
        REGISTER_SUCCESS: 'User registered successfully',
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful',
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_EXISTS: 'Email already registered',
        UNAUTHORIZED: 'Unauthorized access',
        TOKEN_EXPIRED: 'Token has expired',
        TOKEN_INVALID: 'Invalid token',
    },

    // User
    USER: {
        NOT_FOUND: 'User not found',
        UPDATED: 'User updated successfully',
        DELETED: 'User deleted successfully',
        INACTIVE: 'User account is inactive',
    },

    // General
    GENERAL: {
        SUCCESS: 'Operation successful',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully',
        NOT_FOUND: 'Resource not found',
        BAD_REQUEST: 'Bad request',
        INTERNAL_ERROR: 'Internal server error',
        FORBIDDEN: 'Access forbidden',
    },
} as const;

/**
 * Role Hierarchy
 * Higher number = more privileges
 */
export const ROLE_HIERARCHY: Record<string, number> = {
    USER: 1,
    CREATOR: 2,
    ADMIN: 3,
    OWNER: 4,
};

/**
 * Pagination Constants
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

/**
 * Rate Limiting Constants
 */
export const RATE_LIMIT = {
    TTL: 60, // seconds
    LIMIT: 100, // requests per TTL
    AUTH_LIMIT: 10, // auth-related requests per TTL
} as const;
