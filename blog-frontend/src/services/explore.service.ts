import { api } from '@/lib/api-client';
import { Blog } from './blog.service';

export interface SearchQuery {
    q: string;
    type?: 'all' | 'blogs' | 'users';
    page?: number;
    limit?: number;
}

export interface FeedQuery {
    page?: number;
    limit?: number;
    period?: 'day' | 'week' | 'month' | 'all';
}

export interface SearchResults {
    blogs: Blog[];
    users: {
        id: string;
        username?: string;
        name?: string;
        avatar?: string;
        bio?: string;
        followerCount: number;
        isFollowing?: boolean;
    }[];
    meta: {
        total: number;
        query: string;
    };
}

export interface Tag {
    id: string;
    name: string;
    slug: string;
    blogCount: number;
}

export interface Creator {
    id: string;
    username?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    followerCount: number;
    blogCount: number;
    isFollowing?: boolean;
}

export interface PaginatedFeed {
    data: Blog[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PaginatedTags {
    data: Tag[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PaginatedCreators {
    data: Creator[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const exploreService = {
    async search(query: SearchQuery): Promise<SearchResults> {
        const params = new URLSearchParams();
        params.append('q', query.q);
        if (query.type) params.append('type', query.type);
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        return api.get<SearchResults>(`/explore/search?${params.toString()}`);
    },

    async getTrending(query: FeedQuery = {}): Promise<PaginatedFeed> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        if (query.period) params.append('period', query.period);
        return api.get<PaginatedFeed>(`/explore/trending?${params.toString()}`);
    },

    async getForYou(query: FeedQuery = {}): Promise<PaginatedFeed> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        return api.get<PaginatedFeed>(`/explore/for-you?${params.toString()}`);
    },

    async getPopularTags(query: FeedQuery = {}): Promise<PaginatedTags> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        return api.get<PaginatedTags>(`/explore/tags?${params.toString()}`);
    },

    async getBlogsByTag(slug: string, query: FeedQuery = {}): Promise<PaginatedFeed> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        return api.get<PaginatedFeed>(`/explore/tags/${slug}?${params.toString()}`);
    },

    async getTopCreators(query: FeedQuery = {}): Promise<PaginatedCreators> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        return api.get<PaginatedCreators>(`/explore/creators?${params.toString()}`);
    },

    async getRecent(query: FeedQuery = {}): Promise<PaginatedFeed> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', String(query.page));
        if (query.limit) params.append('limit', String(query.limit));
        return api.get<PaginatedFeed>(`/explore/recent?${params.toString()}`);
    },
};
