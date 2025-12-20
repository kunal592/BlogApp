import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { Like, Bookmark, Follow } from '@prisma/client';
import {
    SearchQueryDto,
    FeedQueryDto,
    SearchResultsDto,
    SearchBlogDto,
    CreatorResponseDto,
    TagResponseDto,
    PaginatedFeedDto,
    PaginatedTagsDto,
    PaginatedCreatorsDto,
} from './explore.dto';

// Type definitions for Prisma results
type BlogWithAuthorAndTags = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    viewCount: number;
    likeCount: number;
    readingTime: number | null;
    publishedAt: Date | null;
    author: {
        id: string;
        username: string | null;
        name: string | null;
        avatar: string | null;
        isVerified: boolean;
    };
    tags: Array<{
        tag: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
};

type UserWithBlogCount = {
    id: string;
    username: string | null;
    name: string | null;
    avatar: string | null;
    bio: string | null;
    isVerified: boolean;
    followerCount: number;
    _count: { blogs: number };
};

type TagRecord = {
    id: string;
    name: string;
    slug: string;
    blogCount: number;
    description: string | null;
};

type BlogTagWithBlog = {
    blog: BlogWithAuthorAndTags;
};

@Injectable()
export class ExploreService {
    private readonly logger = new Logger(ExploreService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }


    /**
     * Search blogs and users
     */
    async search(
        query: SearchQueryDto,
        currentUserId?: string,
    ): Promise<SearchResultsDto> {
        const { q, type = 'all', page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        let blogs: SearchBlogDto[] = [];
        let users: CreatorResponseDto[] = [];
        let totalBlogs = 0;
        let totalUsers = 0;

        // Search blogs
        if (type === 'all' || type === 'blogs') {
            const blogWhere = {
                status: 'PUBLISHED' as const,
                deletedAt: null,
                OR: [
                    { title: { contains: q, mode: 'insensitive' as const } },
                    { subtitle: { contains: q, mode: 'insensitive' as const } },
                    { excerpt: { contains: q, mode: 'insensitive' as const } },
                    { content: { contains: q, mode: 'insensitive' as const } },
                ],
            };

            const [foundBlogs, blogCount] = await Promise.all([
                this.prisma.blog.findMany({
                    where: blogWhere,
                    orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }],
                    skip: type === 'blogs' ? skip : 0,
                    take: type === 'blogs' ? limit : 5,
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isVerified: true,
                            },
                        },
                        tags: {
                            include: {
                                tag: { select: { id: true, name: true, slug: true } },
                            },
                        },
                    },
                }),
                this.prisma.blog.count({ where: blogWhere }),
            ]);

            blogs = foundBlogs.map((blog: BlogWithAuthorAndTags) => this.toBlogDto(blog));
            totalBlogs = blogCount;
        }

        // Search users
        if (type === 'all' || type === 'users') {
            const userWhere = {
                deletedAt: null,
                isActive: true,
                role: { in: ['CREATOR' as const, 'ADMIN' as const, 'OWNER' as const] },
                OR: [
                    { username: { contains: q, mode: 'insensitive' as const } },
                    { name: { contains: q, mode: 'insensitive' as const } },
                    { bio: { contains: q, mode: 'insensitive' as const } },
                ],
            };

            const [foundUsers, userCount] = await Promise.all([
                this.prisma.user.findMany({
                    where: userWhere,
                    orderBy: { followerCount: 'desc' },
                    skip: type === 'users' ? skip : 0,
                    take: type === 'users' ? limit : 5,
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        bio: true,
                        isVerified: true,
                        followerCount: true,
                        _count: { select: { blogs: true } },
                    },
                }),
                this.prisma.user.count({ where: userWhere }),
            ]);

            // Check follow status
            let followingIds = new Set<string>();
            if (currentUserId) {
                const follows = await this.prisma.follow.findMany({
                    where: {
                        followerId: currentUserId,
                        followingId: { in: foundUsers.map((u: UserWithBlogCount) => u.id) },
                    },
                    select: { followingId: true },
                });
                followingIds = new Set(follows.map((f: { followingId: string }) => f.followingId));
            }

            users = foundUsers.map((user: UserWithBlogCount) => ({
                id: user.id,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
                bio: user.bio,
                isVerified: user.isVerified,
                followerCount: user.followerCount,
                blogCount: user._count.blogs,
                isFollowing: followingIds.has(user.id),
            }));
            totalUsers = userCount;
        }

        return {
            blogs,
            users,
            meta: {
                page,
                limit,
                totalBlogs,
                totalUsers,
            },
        };
    }

    /**
     * Get trending blogs
     */
    async getTrending(
        query: FeedQueryDto,
        currentUserId?: string,
    ): Promise<PaginatedFeedDto> {
        const { page = 1, limit = 10, period = 'week' } = query;
        const skip = (page - 1) * limit;
        const cacheKey = `trending:${period}:${page}:${limit}`;

        // Check cache
        const cached = await this.cacheManager.get<{ blogs: any[], total: number }>(cacheKey);

        let blogsResult: any[];
        let totalResult: number;

        if (cached) {
            blogsResult = cached.blogs;
            totalResult = cached.total;
        } else {
            // Calculate date threshold based on period
            const now = new Date();
            let dateThreshold: Date;
            switch (period) {
                case 'day':
                    dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    dateThreshold = new Date(0); // All time
            }

            const where = {
                status: 'PUBLISHED' as const,
                deletedAt: null,
                publishedAt: { gte: dateThreshold },
            };

            const [blogs, total] = await Promise.all([
                this.prisma.blog.findMany({
                    where,
                    orderBy: [
                        { likeCount: 'desc' },
                        { viewCount: 'desc' },
                        { bookmarkCount: 'desc' },
                    ],
                    skip,
                    take: limit,
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isVerified: true,
                            },
                        },
                        tags: {
                            include: {
                                tag: true
                            }
                        }
                    },
                }),
                this.prisma.blog.count({ where }),
            ]);

            blogsResult = blogs;
            totalResult = total;

            // Cache for 10 minutes
            await this.cacheManager.set(cacheKey, { blogs: blogsResult, total: totalResult }, 600 * 1000);
        }

        // Get User Interactions (Likes/Bookmarks) if logged in
        let likedBlogs = new Set<string>();
        let bookmarkedBlogs = new Set<string>();
        let followingIds = new Set<string>();

        if (currentUserId) {
            const blogIds = blogsResult.map(b => b.id);
            const authorIds = [...new Set(blogsResult.map(b => b.authorId))]; // Fix: authorId is accessible

            const [likes, bookmarks, following] = await Promise.all([
                this.prisma.like.findMany({
                    where: {
                        userId: currentUserId,
                        blogId: { in: blogIds },
                    },
                }),
                this.prisma.bookmark.findMany({
                    where: {
                        userId: currentUserId,
                        blogId: { in: blogIds },
                    },
                }),
                this.prisma.follow.findMany({
                    where: {
                        followerId: currentUserId,
                        followingId: { in: authorIds },
                    },
                }),
            ]);

            likedBlogs = new Set(likes.map((l: Like) => l.blogId));
            bookmarkedBlogs = new Set(bookmarks.map((b: Bookmark) => b.blogId));
            followingIds = new Set(following.map((f: Follow) => f.followingId));
        }

        return {
            data: blogsResult.map(blog => this.toBlogDto(
                blog,
                likedBlogs.has(blog.id),
                bookmarkedBlogs.has(blog.id),
                followingIds.has(blog.authorId)
            )),
            meta: {
                page,
                limit,
                total: totalResult,
                totalPages: Math.ceil(totalResult / limit),
            },
        };
    }

    /**
     * Get personalized feed ("For You")
     */
    async getForYou(
        userId: string,
        query: FeedQueryDto,
    ): Promise<PaginatedFeedDto> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        // Get users the current user follows
        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followingIds = following.map((f: { followingId: string }) => f.followingId);

        // Get tags from user's liked/bookmarked blogs
        const [likedBlogs, bookmarkedBlogs] = await Promise.all([
            this.prisma.like.findMany({
                where: { userId },
                select: { blog: { select: { tags: { select: { tagId: true } } } } },
                take: 50,
            }),
            this.prisma.bookmark.findMany({
                where: { userId },
                select: { blog: { select: { tags: { select: { tagId: true } } } } },
                take: 50,
            }),
        ]);

        const preferredTagIds = new Set<string>();
        [...likedBlogs, ...bookmarkedBlogs].forEach((item: { blog: { tags: Array<{ tagId: string }> } }) => {
            item.blog.tags.forEach((t: { tagId: string }) => preferredTagIds.add(t.tagId));
        });

        // Build query with weighted factors
        const where = {
            status: 'PUBLISHED' as const,
            deletedAt: null,
            authorId: { not: userId }, // Exclude own blogs
        };

        // Get blogs from followed users first, then by preferred tags, then trending
        const [followingBlogs, tagBlogs, trendingBlogs, total] = await Promise.all([
            followingIds.length > 0
                ? this.prisma.blog.findMany({
                    where: { ...where, authorId: { in: followingIds } },
                    orderBy: { publishedAt: 'desc' },
                    take: Math.ceil(limit / 2),
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isVerified: true,
                            },
                        },
                        tags: {
                            include: {
                                tag: { select: { id: true, name: true, slug: true } },
                            },
                        },
                    },
                })
                : Promise.resolve([]),
            preferredTagIds.size > 0
                ? this.prisma.blog.findMany({
                    where: {
                        ...where,
                        tags: { some: { tagId: { in: Array.from(preferredTagIds) } } },
                    },
                    orderBy: { likeCount: 'desc' },
                    take: Math.ceil(limit / 2),
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                name: true,
                                avatar: true,
                                isVerified: true,
                            },
                        },
                        tags: {
                            include: {
                                tag: { select: { id: true, name: true, slug: true } },
                            },
                        },
                    },
                })
                : Promise.resolve([]),
            this.prisma.blog.findMany({
                where,
                orderBy: [{ likeCount: 'desc' }, { viewCount: 'desc' }],
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: { select: { id: true, name: true, slug: true } },
                        },
                    },
                },
            }),
            this.prisma.blog.count({ where }),
        ]);

        // Deduplicate and merge results
        const seenIds = new Set<string>();
        const mergedBlogs: typeof trendingBlogs = [];

        [...followingBlogs, ...tagBlogs, ...trendingBlogs].forEach((blog) => {
            if (!seenIds.has(blog.id) && mergedBlogs.length < limit) {
                seenIds.add(blog.id);
                mergedBlogs.push(blog);
            }
        });

        return {
            data: mergedBlogs.map((blog: BlogWithAuthorAndTags) => this.toBlogDto(blog)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get popular tags
     */
    async getPopularTags(query: FeedQueryDto): Promise<PaginatedTagsDto> {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            this.prisma.tag.findMany({
                orderBy: { blogCount: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.tag.count(),
        ]);

        return {
            data: tags.map((tag: TagRecord) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
                blogCount: tag.blogCount,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get blogs by tag
     */
    async getBlogsByTag(
        tagSlug: string,
        query: FeedQueryDto,
        currentUserId?: string,
    ): Promise<PaginatedFeedDto> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const tag = await this.prisma.tag.findUnique({
            where: { slug: tagSlug },
        });

        if (!tag) {
            return {
                data: [],
                meta: { page, limit, total: 0, totalPages: 0 },
            };
        }

        const where = {
            tags: { some: { tagId: tag.id } },
            blog: {
                status: 'PUBLISHED' as const,
                deletedAt: null,
            },
        };

        const [blogTags, total] = await Promise.all([
            this.prisma.blogTag.findMany({
                where,
                orderBy: { blog: { likeCount: 'desc' } },
                skip,
                take: limit,
                include: {
                    blog: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    avatar: true,
                                    isVerified: true,
                                },
                            },
                            tags: {
                                include: {
                                    tag: { select: { id: true, name: true, slug: true } },
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.blogTag.count({ where }),
        ]);

        return {
            data: blogTags.map((bt: BlogTagWithBlog) => this.toBlogDto(bt.blog)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get top creators
     */
    async getTopCreators(
        query: FeedQueryDto,
        currentUserId?: string,
    ): Promise<PaginatedCreatorsDto> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,
            isActive: true,
            role: { in: ['CREATOR' as const, 'ADMIN' as const, 'OWNER' as const] },
        };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { followerCount: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    username: true,
                    name: true,
                    avatar: true,
                    bio: true,
                    isVerified: true,
                    followerCount: true,
                    _count: { select: { blogs: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        // Check follow status
        let followingIds = new Set<string>();
        if (currentUserId) {
            const follows = await this.prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: { in: users.map((u: UserWithBlogCount) => u.id) },
                },
                select: { followingId: true },
            });
            followingIds = new Set(follows.map((f: { followingId: string }) => f.followingId));
        }

        return {
            data: users.map((user: UserWithBlogCount) => ({
                id: user.id,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
                bio: user.bio,
                isVerified: user.isVerified,
                followerCount: user.followerCount,
                blogCount: user._count.blogs,
                isFollowing: followingIds.has(user.id),
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get recent blogs
     */
    async getRecent(
        query: FeedQueryDto,
        currentUserId?: string,
    ): Promise<PaginatedFeedDto> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where = {
            status: 'PUBLISHED' as const,
            deletedAt: null,
        };

        const [blogs, total] = await Promise.all([
            this.prisma.blog.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: { select: { id: true, name: true, slug: true } },
                        },
                    },
                },
            }),
            this.prisma.blog.count({ where }),
        ]);

        return {
            data: blogs.map((blog: BlogWithAuthorAndTags) => this.toBlogDto(blog)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Convert blog to DTO
     */
    private toBlogDto(
        blog: {
            id: string;
            slug: string;
            title: string;
            excerpt: string | null;
            coverImage: string | null;
            viewCount: number;
            likeCount: number;
            readingTime: number | null;
            publishedAt: Date | null;
            author: {
                id: string;
                username: string | null;
                name: string | null;
                avatar: string | null;
                isVerified: boolean;
            };
            tags: Array<{
                tag: {
                    id: string;
                    name: string;
                    slug: string;
                };
            }>;
        },
        isLiked = false,
        isBookmarked = false,
        isFollowing = false,
    ): SearchBlogDto {
        return {
            id: blog.id,
            slug: blog.slug,
            title: blog.title,
            excerpt: blog.excerpt,
            coverImage: blog.coverImage,
            viewCount: blog.viewCount,
            likeCount: blog.likeCount,
            readingTime: blog.readingTime,
            publishedAt: blog.publishedAt,
            author: blog.author,
            tags: blog.tags.map((t) => ({
                id: t.tag.id,
                name: t.tag.name,
                slug: t.tag.slug,
                blogCount: 0,
            })),
            isLiked,
            isBookmarked,
            isFollowing,
        };
    }
}
