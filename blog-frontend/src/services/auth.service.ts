import { api } from '@/lib/api-client';

export interface User {
    id: string;
    email: string;
    username?: string;
    name?: string;
    avatar?: string;
    role: 'USER' | 'CREATOR' | 'ADMIN' | 'OWNER';
    bio?: string;
    followerCount: number;
    followingCount: number;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    username?: string;
    name?: string;
}

export interface AuthResponse {
    data: {
        user: User;
        message: string;
    };
}

export const authService = {
    async login(dto: LoginDto): Promise<User> {
        const response = await api.post<AuthResponse>('/auth/login', dto);
        return response.data.user;
    },

    async register(dto: RegisterDto): Promise<User> {
        const response = await api.post<AuthResponse>('/auth/register', dto);
        return response.data.user;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout', {});
    },

    async getMe(): Promise<User> {
        const response = await api.get<{ data: User }>('/auth/me');
        return response.data;
    },
};
