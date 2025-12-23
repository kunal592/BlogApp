import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateBlogDto,
    UpdateBlogDto,
    BlogQueryDto,
    MyBlogsQueryDto,
    BlogResponseDto,
    BlogListItemDto,
    PaginatedBlogsDto,
    BlogAuthorDto,
    BlogTagDto,
} from './blogs.dto';
import { MESSAGES } from '../../common/constants';

// Type for blog with includes
type BlogWithAuthorAndTags = {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    status: string;
    isExclusive: boolean;
    price: number | null;
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    commentCount: number;
    readingTime: number | null;
    metaTitle: string | null;
    metaDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    deletedAt: Date | null;
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

@Injectable()
export class BlogsService {
    private readonly logger = new Logger(BlogsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate URL-friendly slug from title
     */
    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens
            .substring(0, 100); // Limit length
    }

    /**
     * Ensure slug is unique by appending number if needed
     */
    private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.prisma.blog.findUnique({
                where: { slug },
                select: { id: true },
            });

            if (!existing || existing.id === excludeId) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    /**
     * Calculate estimated reading time
     */
    private calculateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }

    /**
     * Create or get tags by name
     */
    private async getOrCreateTags(tagNames: string[]): Promise<{ id: string }[]> {
        const tags: { id: string }[] = [];

        for (const name of tagNames) {
            const slug = name.toLowerCase().replace(/\s+/g, '-');

            let tag = await this.prisma.tag.findUnique({
                where: { slug },
                select: { id: true },
            });

            if (!tag) {
                tag = await this.prisma.tag.create({
                    data: { name, slug },
                    select: { id: true },
                });
            }

            tags.push(tag);
        }

        return tags;
    }

    /**
     * Create a new blog (draft)
     */
    async create(authorId: string, dto: CreateBlogDto): Promise<BlogResponseDto> {
        // Check if user is a creator
        const user = await this.prisma.user.findUnique({
            where: { id: authorId },
            select: { role: true },
        });

        if (!user || (user.role !== 'USER' && user.role !== 'CREATOR' && user.role !== 'ADMIN' && user.role !== 'OWNER')) {
            throw new ForbiddenException('Only creators can publish blogs');
        }

        // Generate unique slug
        const baseSlug = this.generateSlug(dto.title);
        const slug = await this.ensureUniqueSlug(baseSlug);

        // Calculate reading time
        const readingTime = this.calculateReadingTime(dto.content);

        // Handle tags
        const tagIds = dto.tags ? await this.getOrCreateTags(dto.tags) : [];

        // Create blog with tags
        const blog = await this.prisma.blog.create({
            data: {
                slug,
                title: dto.title,
                subtitle: dto.subtitle,
                content: dto.content,
                excerpt: dto.excerpt,
                coverImage: dto.coverImage,
                isExclusive: dto.isExclusive || false,
                price: dto.isExclusive ? dto.price : null,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,
                metaKeywords: dto.metaKeywords,
                readingTime,
                authorId,
                tags: {
                    create: tagIds.map((t) => ({ tagId: t.id })),
                },
            },
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
                        tag: {
                            select: { id: true, name: true, slug: true },
                        },
                    },
                },
            },
        });

        this.logger.log(`Blog "${blog.title}" created by user ${authorId}`);

        return this.toBlogResponseDto(blog);
    }

    /**
     * Get published blogs (public feed)
     */
    async findAll(
        query: BlogQueryDto,
        currentUserId?: string,
    ): Promise<PaginatedBlogsDto> {
        const { page = 1, limit = 10, sort = 'latest', search } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            status: 'PUBLISHED',
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { subtitle: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Build order by
        let orderBy: any = { publishedAt: 'desc' };
        if (sort === 'popular') {
            orderBy = { likeCount: 'desc' };
        } else if (sort === 'trending') {
            orderBy = [{ viewCount: 'desc' }, { likeCount: 'desc' }];
        }

        const [blogs, total] = await Promise.all([
            this.prisma.blog.findMany({
                where,
                orderBy,
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

        // Get user interactions if authenticated
        let likedBlogIds = new Set<string>();
        let bookmarkedBlogIds = new Set<string>();

        if (currentUserId) {
            const [likes, bookmarks] = await Promise.all([
                this.prisma.like.findMany({
                    where: {
                        userId: currentUserId,
                        blogId: { in: blogs.map((b: { id: string }) => b.id) },
                    },
                    select: { blogId: true },
                }),
                this.prisma.bookmark.findMany({
                    where: {
                        userId: currentUserId,
                        blogId: { in: blogs.map((b: { id: string }) => b.id) },
                    },
                    select: { blogId: true },
                }),
            ]);

            likedBlogIds = new Set(likes.map((l: { blogId: string }) => l.blogId));
            bookmarkedBlogIds = new Set(bookmarks.map((b: { blogId: string }) => b.blogId));
        }

        return {
            data: blogs.map((blog: BlogWithAuthorAndTags) => this.toBlogListItemDto(blog, likedBlogIds, bookmarkedBlogIds)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get current user's blogs (including drafts)
     */
    async findMyBlogs(
        userId: string,
        query: MyBlogsQueryDto,
    ): Promise<PaginatedBlogsDto> {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            authorId: userId,
            deletedAt: null,
        };

        if (status) {
            where.status = status;
        }

        const [blogs, total] = await Promise.all([
            this.prisma.blog.findMany({
                where,
                orderBy: { updatedAt: 'desc' },
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
            data: blogs.map((blog: BlogWithAuthorAndTags) => this.toBlogListItemDto(blog, new Set<string>(), new Set<string>())),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get blog by slug
     */
    async findBySlug(
        slug: string,
        currentUserId?: string,
    ): Promise<BlogResponseDto> {
        const blog = await this.prisma.blog.findUnique({
            where: { slug },
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
        });

        if (!blog || blog.deletedAt) {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        // Check access for drafts
        if (blog.status === 'DRAFT' && blog.authorId !== currentUserId) {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        // Check access for archived
        if (blog.status === 'ARCHIVED' && blog.authorId !== currentUserId) {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        // Get user interactions
        let isLiked = false;
        let isBookmarked = false;

        if (currentUserId) {
            const [like, bookmark] = await Promise.all([
                this.prisma.like.findUnique({
                    where: { userId_blogId: { userId: currentUserId, blogId: blog.id } },
                }),
                this.prisma.bookmark.findUnique({
                    where: { userId_blogId: { userId: currentUserId, blogId: blog.id } },
                }),
            ]);

            isLiked = !!like;
            isBookmarked = !!bookmark;
        }

        return this.toBlogResponseDto(blog, isLiked, isBookmarked);
    }

    /**
     * Update a blog
     */
    async update(
        blogId: string,
        userId: string,
        dto: UpdateBlogDto,
    ): Promise<BlogResponseDto> {
        const blog = await this.prisma.blog.findUnique({
            where: { id: blogId },
            select: { authorId: true, slug: true, deletedAt: true },
        });

        if (!blog || blog.deletedAt) {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        if (blog.authorId !== userId) {
            throw new ForbiddenException('You can only edit your own blogs');
        }

        // Handle slug update if title changes
        let newSlug = blog.slug;
        if (dto.title) {
            const baseSlug = this.generateSlug(dto.title);
            newSlug = await this.ensureUniqueSlug(baseSlug, blogId);
        }

        // Calculate reading time if content changes
        const readingTime = dto.content
            ? this.calculateReadingTime(dto.content)
            : undefined;

        // Handle tags update
        if (dto.tags !== undefined) {
            // Delete existing tags
            await this.prisma.blogTag.deleteMany({ where: { blogId } });

            // Create new tags
            if (dto.tags.length > 0) {
                const tagIds = await this.getOrCreateTags(dto.tags);
                await this.prisma.blogTag.createMany({
                    data: tagIds.map((t) => ({ blogId, tagId: t.id })),
                });
            }
        }

        const updatedBlog = await this.prisma.blog.update({
            where: { id: blogId },
            data: {
                ...(dto.title && { title: dto.title, slug: newSlug }),
                ...(dto.subtitle !== undefined && { subtitle: dto.subtitle }),
                ...(dto.content && { content: dto.content }),
                ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
                ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
                ...(dto.isExclusive !== undefined && { isExclusive: dto.isExclusive }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
                ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
                ...(dto.metaKeywords !== undefined && { metaKeywords: dto.metaKeywords }),
                ...(readingTime && { readingTime }),
            },
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
        });

        this.logger.log(`Blog ${blogId} updated by user ${userId}`);

        return this.toBlogResponseDto(updatedBlog);
    }

    /**
     * Soft delete a blog
     */
    async delete(blogId: string, userId: string): Promise<void> {
        const blog = await this.prisma.blog.findUnique({
            where: { id: blogId },
            select: { authorId: true, deletedAt: true },
        });

        if (!blog || blog.deletedAt) {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        if (blog.authorId !== userId) {
            throw new ForbiddenException('You can only delete your own blogs');
        }

        await this.prisma.blog.update({
            where: { id: blogId },
            data: { deletedAt: new Date() },
        });

        this.logger.log(`Blog ${blogId} deleted by user ${userId}`);
    }

    /**
     * Publish a blog
     */
    async publish(blogId: string, userId: string): Promise<BlogResponseDto> {
        const blog = await this.prisma.blog.findUnique({
            where: { id: blogId },
            select: { authorId: true, status: true, deletedAt: true },
        });

        if (!blog || blog.deletedAt) {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        if (blog.authorId !== userId) {
            throw new ForbiddenException('You can only publish your own blogs');
        }

        if (blog.status === 'PUBLISHED') {
            throw new BadRequestException('Blog is already published');
        }

        const updatedBlog = await this.prisma.blog.update({
            where: { id: blogId },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
            },
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
        });

        this.logger.log(`Blog ${blogId} published by user ${userId}`);

        return this.toBlogResponseDto(updatedBlog);
    }

    /**
     * Unpublish (archive) a blog
     */
    async unpublish(blogId: string, userId: string): Promise<BlogResponseDto> {
        const blog = await this.prisma.blog.findUnique({
            where: { id: blogId },
            select: { authorId: true, status: true, deletedAt: true },
        });

        if (!blog || blog.deletedAt) {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        if (blog.authorId !== userId) {
            throw new ForbiddenException('You can only unpublish your own blogs');
        }

        if (blog.status !== 'PUBLISHED') {
            throw new BadRequestException('Blog is not published');
        }

        const updatedBlog = await this.prisma.blog.update({
            where: { id: blogId },
            data: { status: 'ARCHIVED' },
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
        });

        this.logger.log(`Blog ${blogId} unpublished by user ${userId}`);

        return this.toBlogResponseDto(updatedBlog);
    }

    /**
     * Like a blog
     */
    async like(blogId: string, userId: string): Promise<void> {
        const blog = await this.prisma.blog.findUnique({
            where: { id: blogId },
            select: { id: true, status: true, deletedAt: true },
        });

        if (!blog || blog.deletedAt || blog.status !== 'PUBLISHED') {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        const existingLike = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });

        if (existingLike) {
            throw new ConflictException('You have already liked this blog');
        }

        await this.prisma.$transaction([
            this.prisma.like.create({
                data: { userId, blogId },
            }),
            this.prisma.blog.update({
                where: { id: blogId },
                data: { likeCount: { increment: 1 } },
            }),
        ]);

        this.logger.log(`User ${userId} liked blog ${blogId}`);
    }

    /**
     * Unlike a blog
     */
    async unlike(blogId: string, userId: string): Promise<void> {
        const existingLike = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });

        if (!existingLike) {
            throw new NotFoundException('You have not liked this blog');
        }

        await this.prisma.$transaction([
            this.prisma.like.delete({
                where: { userId_blogId: { userId, blogId } },
            }),
            this.prisma.blog.update({
                where: { id: blogId },
                data: { likeCount: { decrement: 1 } },
            }),
        ]);

        this.logger.log(`User ${userId} unliked blog ${blogId}`);
    }

    /**
     * Bookmark a blog
     */
    async bookmark(blogId: string, userId: string): Promise<void> {
        const blog = await this.prisma.blog.findUnique({
            where: { id: blogId },
            select: { id: true, status: true, deletedAt: true },
        });

        if (!blog || blog.deletedAt || blog.status !== 'PUBLISHED') {
            throw new NotFoundException(MESSAGES.BLOG.NOT_FOUND);
        }

        const existingBookmark = await this.prisma.bookmark.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });

        if (existingBookmark) {
            throw new ConflictException('You have already bookmarked this blog');
        }

        await this.prisma.$transaction([
            this.prisma.bookmark.create({
                data: { userId, blogId },
            }),
            this.prisma.blog.update({
                where: { id: blogId },
                data: { bookmarkCount: { increment: 1 } },
            }),
        ]);

        this.logger.log(`User ${userId} bookmarked blog ${blogId}`);
    }

    /**
     * Remove bookmark
     */
    async unbookmark(blogId: string, userId: string): Promise<void> {
        const existingBookmark = await this.prisma.bookmark.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });

        if (!existingBookmark) {
            throw new NotFoundException('You have not bookmarked this blog');
        }

        await this.prisma.$transaction([
            this.prisma.bookmark.delete({
                where: { userId_blogId: { userId, blogId } },
            }),
            this.prisma.blog.update({
                where: { id: blogId },
                data: { bookmarkCount: { decrement: 1 } },
            }),
        ]);

        this.logger.log(`User ${userId} unbookmarked blog ${blogId}`);
    }

    /**
     * Get user's bookmarked blogs
     */
    async getBookmarks(
        userId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginatedBlogsDto> {
        const skip = (page - 1) * limit;

        const [bookmarks, total] = await Promise.all([
            this.prisma.bookmark.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
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
            this.prisma.bookmark.count({ where: { userId } }),
        ]);

        // Get likes for these blogs
        const blogIds: string[] = bookmarks.map((b: { blog: { id: string } }) => b.blog.id);
        const likes = await this.prisma.like.findMany({
            where: { userId, blogId: { in: blogIds } },
            select: { blogId: true },
        });
        const likedBlogIds = new Set<string>(likes.map((l: { blogId: string }) => l.blogId));

        return {
            data: bookmarks
                .filter((b: { blog: { deletedAt: Date | null; status: string } }) => !b.blog.deletedAt && b.blog.status === 'PUBLISHED')
                .map((b: { blog: BlogWithAuthorAndTags }) => this.toBlogListItemDto(b.blog, likedBlogIds, new Set<string>(blogIds))),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get user's liked blogs
     */
    async getLiked(
        userId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginatedBlogsDto> {
        const skip = (page - 1) * limit;

        const [likes, total] = await Promise.all([
            this.prisma.like.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
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
            this.prisma.like.count({ where: { userId } }),
        ]);

        // Get bookmarks for these blogs
        const blogIds: string[] = likes.map((l: { blog: { id: string } }) => l.blog.id);
        const bookmarks = await this.prisma.bookmark.findMany({
            where: { userId, blogId: { in: blogIds } },
            select: { blogId: true },
        });
        const bookmarkedBlogIds = new Set<string>(bookmarks.map((b: { blogId: string }) => b.blogId));

        return {
            data: likes
                .filter((l: { blog: { deletedAt: Date | null; status: string } }) => !l.blog.deletedAt && l.blog.status === 'PUBLISHED')
                .map((l: { blog: BlogWithAuthorAndTags }) => this.toBlogListItemDto(l.blog, new Set<string>(blogIds), bookmarkedBlogIds)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Increment view count
     */
    async incrementView(blogId: string): Promise<void> {
        await this.prisma.blog.update({
            where: { id: blogId },
            data: { viewCount: { increment: 1 } },
        });
    }

    /**
     * Get blogs by author username
     */
    async findByAuthor(
        username: string,
        query: BlogQueryDto,
        currentUserId?: string,
    ): Promise<PaginatedBlogsDto> {
        const author = await this.prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        if (!author) {
            throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
        }

        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const where = {
            authorId: author.id,
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

        // Get user interactions
        let likedBlogIds = new Set<string>();
        let bookmarkedBlogIds = new Set<string>();

        if (currentUserId) {
            const [likes, bookmarks] = await Promise.all([
                this.prisma.like.findMany({
                    where: { userId: currentUserId, blogId: { in: blogs.map((b: { id: string }) => b.id) } },
                    select: { blogId: true },
                }),
                this.prisma.bookmark.findMany({
                    where: { userId: currentUserId, blogId: { in: blogs.map((b: { id: string }) => b.id) } },
                    select: { blogId: true },
                }),
            ]);

            likedBlogIds = new Set(likes.map((l: { blogId: string }) => l.blogId));
            bookmarkedBlogIds = new Set(bookmarks.map((b: { blogId: string }) => b.blogId));
        }

        return {
            data: blogs.map((blog: BlogWithAuthorAndTags) => this.toBlogListItemDto(blog, likedBlogIds, bookmarkedBlogIds)),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Convert blog to response DTO
     */
    private toBlogResponseDto(
        blog: any,
        isLiked = false,
        isBookmarked = false,
    ): BlogResponseDto {
        return {
            id: blog.id,
            slug: blog.slug,
            title: blog.title,
            subtitle: blog.subtitle,
            content: blog.content,
            excerpt: blog.excerpt,
            coverImage: blog.coverImage,
            status: blog.status,
            isExclusive: blog.isExclusive,
            price: blog.price,
            viewCount: blog.viewCount,
            likeCount: blog.likeCount,
            bookmarkCount: blog.bookmarkCount,
            commentCount: blog.commentCount,
            readingTime: blog.readingTime,
            metaTitle: blog.metaTitle,
            metaDescription: blog.metaDescription,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
            publishedAt: blog.publishedAt,
            author: blog.author as BlogAuthorDto,
            tags: blog.tags.map((t: any) => t.tag as BlogTagDto),
            isLiked,
            isBookmarked,
        };
    }

    /**
     * Convert blog to list item DTO
     */
    private toBlogListItemDto(
        blog: any,
        likedBlogIds: Set<string>,
        bookmarkedBlogIds: Set<string>,
    ): BlogListItemDto {
        return {
            id: blog.id,
            slug: blog.slug,
            title: blog.title,
            subtitle: blog.subtitle,
            excerpt: blog.excerpt,
            coverImage: blog.coverImage,
            status: blog.status,
            isExclusive: blog.isExclusive,
            viewCount: blog.viewCount,
            likeCount: blog.likeCount,
            bookmarkCount: blog.bookmarkCount,
            readingTime: blog.readingTime,
            publishedAt: blog.publishedAt,
            author: blog.author as BlogAuthorDto,
            tags: blog.tags.map((t: any) => t.tag as BlogTagDto),
            isLiked: likedBlogIds.has(blog.id),
            isBookmarked: bookmarkedBlogIds.has(blog.id),
        };
    }
}
