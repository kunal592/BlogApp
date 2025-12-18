/**
 * Notifications API Contract
 * 
 * This file defines all notification-related endpoints.
 * Both frontend and backend MUST import from this file.
 */

export const NOTIFICATIONS_API = {
    // Base path for all notification routes
    BASE: 'notifications',

    // Endpoints
    GET_ALL: {
        method: 'GET',
        path: '/notifications',
        description: 'Get all notifications for the current user',
    },

    MARK_READ: {
        method: 'PATCH',
        path: '/notifications/:id/read',
        description: 'Mark a specific notification as read',
    },

    MARK_ALL_READ: {
        method: 'PATCH',
        path: '/notifications/read-all',
        description: 'Mark all notifications as read',
    },

    GET_UNREAD_COUNT: {
        method: 'GET',
        path: '/notifications/unread-count',
        description: 'Get count of unread notifications',
    },
} as const;

export type NotificationEndpoint = keyof typeof NOTIFICATIONS_API;
