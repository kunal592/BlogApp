import { api } from '@/lib/api-client';

export interface Blog {
    id: string;
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    isPremium: boolean;
    price?: number;
    readTime?: number;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    bookmarkCount: number;
    author: {
        id: string;
        name?: string;
        username?: string;
        avatar?: string;
    };
    tags?: { id: string; name: string; slug: string }[];
    isLiked?: boolean;
    isBookmarked?: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface CreateBlogDto {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    isPremium?: boolean;
    price?: number;
    tags?: string[];
}

export interface UpdateBlogDto {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    isPremium?: boolean;
    price?: number;
    tags?: string[];
}

export interface BlogResponse {
    data: Blog;
    message?: string;
}

export interface BlogsListResponse {
    data: Blog[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const blogService = {
    /**
     * Create a new blog (as draft)
     */
    async create(dto: CreateBlogDto): Promise<Blog> {
        const response = await api.post<BlogResponse>('/blogs', dto);
        return response.data;
    },

    /**
     * Update a blog
     */
    async update(id: string, dto: UpdateBlogDto): Promise<Blog> {
        const response = await api.patch<BlogResponse>(`/blogs/${id}`, dto);
        return response.data;
    },

    /**
     * Get blog by slug
     */
    async getBySlug(slug: string): Promise<Blog> {
        const response = await api.get<{ data: Blog }>(`/blogs/${slug}`);
        return response.data;
    },

    /**
     * Get current user's blogs
     */
    async getMyBlogs(): Promise<Blog[]> {
        const response = await api.get<BlogsListResponse>('/blogs/my');
        return response.data;
    },

    /**
     * Publish a blog
     */
    async publish(id: string): Promise<Blog> {
        const response = await api.post<BlogResponse>(`/blogs/${id}/publish`, {});
        return response.data;
    },

    /**
     * Unpublish a blog
     */
    async unpublish(id: string): Promise<Blog> {
        const response = await api.post<BlogResponse>(`/blogs/${id}/unpublish`, {});
        return response.data;
    },

    /**
     * Delete a blog
     */
    async delete(id: string): Promise<void> {
        await api.delete(`/blogs/${id}`);
    },

    /**
     * Like a blog
     */
    async like(id: string): Promise<void> {
        await api.post(`/blogs/${id}/like`, {});
    },

    /**
     * Unlike a blog
     */
    async unlike(id: string): Promise<void> {
        await api.delete(`/blogs/${id}/like`);
    },

    /**
     * Bookmark a blog
     */
    async bookmark(id: string): Promise<void> {
        await api.post(`/blogs/${id}/bookmark`, {});
    },

    /**
     * Remove bookmark
     */
    async removeBookmark(id: string): Promise<void> {
        await api.delete(`/blogs/${id}/bookmark`);
    },

    /**
     * Record a view
     */
    async recordView(id: string): Promise<void> {
        await api.post(`/blogs/${id}/view`, {});
    },
};
