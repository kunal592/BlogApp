import { api } from '@/lib/api-client';

export interface Notification {
    id: string;
    type: 'FOLLOW' | 'LIKE' | 'COMMENT' | 'REPLY' | 'PURCHASE' | 'SYSTEM';
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    actor?: {
        id: string;
        name?: string;
        username?: string;
        avatar?: string;
    };
    createdAt: string;
}

export interface PaginatedNotifications {
    data: Notification[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const notificationService = {
    async getAll(page = 1, limit = 20): Promise<PaginatedNotifications> {
        return api.get<PaginatedNotifications>(`/notifications?page=${page}&limit=${limit}`);
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get<{ data: { count: number } }>('/notifications/unread-count');
        return response.data.count;
    },

    async markAsRead(id: string): Promise<void> {
        await api.patch(`/notifications/${id}/read`, {});
    },

    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/read-all', {});
    },
};
