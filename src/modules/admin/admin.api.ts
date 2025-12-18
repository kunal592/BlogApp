/**
 * Admin API Contract
 * 
 * Defines endpoints for administrative tasks.
 */

export const ADMIN_API = {
    BASE: 'admin',

    // Dashboard
    GET_STATS: {
        method: 'GET',
        path: '/admin/stats',
        description: 'Get dashboard statistics',
    },

    // Users
    GET_USERS: {
        method: 'GET',
        path: '/admin/users',
        description: 'Get paginated list of users',
    },

    UPDATE_USER_ROLE: {
        method: 'PATCH',
        path: '/admin/users/:id/role',
        description: 'Update user role',
    },

    BAN_USER: {
        method: 'PATCH',
        path: '/admin/users/:id/ban',
        description: 'Deactivate a user account',
    },

    UNBAN_USER: {
        method: 'PATCH',
        path: '/admin/users/:id/unban',
        description: 'Reactivate a user account',
    },

    // Content
    DELETE_BLOG: {
        method: 'DELETE',
        path: '/admin/blogs/:id',
        description: 'Force delete a blog post',
    },
} as const;
