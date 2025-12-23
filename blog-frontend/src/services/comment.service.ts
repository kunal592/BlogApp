import { api } from '@/lib/api-client';

export interface Comment {
    id: string;
    content: string;
    author: {
        id: string;
        name?: string;
        username?: string;
        avatar?: string;
    };
    blogId: string;
    parentId?: string;
    likeCount: number;
    isLiked?: boolean;
    replies?: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentDto {
    blogId: string;
    content: string;
    parentId?: string;
}

export interface PaginatedComments {
    data: Comment[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const commentService = {
    async create(dto: CreateCommentDto): Promise<Comment> {
        const response = await api.post<{ data: Comment }>('/community/comments', dto);
        return response.data;
    },

    async getBlogComments(blogId: string, page = 1, limit = 20): Promise<PaginatedComments> {
        return api.get<PaginatedComments>(`/community/comments/blog/${blogId}?page=${page}&limit=${limit}`);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/community/comments/${id}`);
    },

    async like(id: string): Promise<void> {
        await api.post(`/community/comments/${id}/like`, {});
    },

    async unlike(id: string): Promise<void> {
        await api.delete(`/community/comments/${id}/like`);
    },
};
