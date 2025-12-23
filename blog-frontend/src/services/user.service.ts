import { api } from '@/lib/api-client';

export interface UserProfile {
    id: string;
    email: string;
    username?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    role: 'USER' | 'CREATOR' | 'ADMIN' | 'OWNER';
    followerCount: number;
    followingCount: number;
    blogCount?: number;
    createdAt: string;
}

export interface PublicProfile {
    id: string;
    username?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    role: string;
    followerCount: number;
    followingCount: number;
    blogCount: number;
    isFollowing?: boolean;
    createdAt: string;
}

export interface UpdateProfileDto {
    name?: string;
    username?: string;
    bio?: string;
    avatar?: string;
}

export interface FollowUser {
    id: string;
    username?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    isFollowing?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const userService = {
    async getProfile(): Promise<UserProfile> {
        const response = await api.get<{ data: UserProfile }>('/users/profile');
        return response.data;
    },

    async updateProfile(dto: UpdateProfileDto): Promise<UserProfile> {
        const response = await api.patch<{ data: UserProfile; message: string }>('/users/profile', dto);
        return response.data;
    },

    async upgradeToCreator(): Promise<UserProfile> {
        const response = await api.post<{ data: UserProfile; message: string }>('/users/upgrade-creator', {});
        return response.data;
    },

    async getPublicProfile(username: string): Promise<PublicProfile> {
        const response = await api.get<{ data: PublicProfile }>(`/users/${username}`);
        return response.data;
    },

    async follow(userId: string): Promise<void> {
        await api.post(`/users/${userId}/follow`, {});
    },

    async unfollow(userId: string): Promise<void> {
        await api.delete(`/users/${userId}/follow`);
    },

    async getFollowers(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<FollowUser>> {
        return api.get<PaginatedResponse<FollowUser>>(`/users/${userId}/followers?page=${page}&limit=${limit}`);
    },

    async getFollowing(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<FollowUser>> {
        return api.get<PaginatedResponse<FollowUser>>(`/users/${userId}/following?page=${page}&limit=${limit}`);
    },
};
