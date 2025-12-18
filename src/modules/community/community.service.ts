import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateCommentDto,
    CommentQueryDto,
    CommentResponseDto,
    PaginatedCommentsDto,
    CommentUserDto,
} from './community.dto';

// Define types for Prisma Query Results to avoid implicit any errors
type UserSelect = {
    id: string;
    username: string | null;
    name: string | null;
    avatar: string | null;
    isVerified: boolean;
};

type CommentWithRelations = {
    id: string;
    content: string;
    userId: string;
    blogId: string;
    parentId: string | null;
    likeCount: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    user: UserSelect;
    replies?: CommentWithRelations[];
};

@Injectable()
export class CommunityService {
    private readonly logger = new Logger(CommunityService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a comment
     */
    async create(userId: string, dto: CreateCommentDto): Promise<CommentResponseDto> {
        // Check if blog exists
        const blog = await this.prisma.blog.findUnique({
            where: { id: dto.blogId },
            select: { id: true, status: true },
        });

        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        if (blog.status !== 'PUBLISHED') {
            throw new ForbiddenException('Cannot comment on unpublished blogs');
        }

        // Check parent if reply
        if (dto.parentId) {
            const parent = await this.prisma.comment.findUnique({
                where: { id: dto.parentId },
                select: { id: true, blogId: true },
            });

            if (!parent) {
                throw new NotFoundException('Parent comment not found');
            }

            if (parent.blogId !== dto.blogId) {
                throw new ForbiddenException('Parent comment belongs to a different blog');
            }
        }

        const comment = await this.prisma.comment.create({
            data: {
                content: dto.content,
                userId,
                blogId: dto.blogId,
                parentId: dto.parentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        avatar: true,
                        isVerified: true,
                    },
                },
            },
        });

        // Increment blog comment count
        await this.prisma.blog.update({
            where: { id: dto.blogId },
            data: { commentCount: { increment: 1 } },
        });

        this.logger.log(`User ${userId} commented on blog ${dto.blogId}`);

        return this.toCommentDto(comment);
    }

    /**
     * Get comments for a blog (Top-level only, with counts or limited replies)
     * For now, let's fetch top-level comments and 1 level of replies to keep it simple and performant.
     */
    async getBlogComments(
        blogId: string,
        query: CommentQueryDto,
        currentUserId?: string,
    ): Promise<PaginatedCommentsDto> {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        // Fetch top-level comments
        const where = {
            blogId,
            parentId: null,
            deletedAt: null,
        };

        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            avatar: true,
                            isVerified: true,
                        },
                    },
                    replies: {
                        where: { deletedAt: null },
                        orderBy: { createdAt: 'asc' },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true,
                                    avatar: true,
                                    isVerified: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.comment.count({ where }),
        ]);

        // Check interactions if authenticated
        let likedCommentIds = new Set<string>();
        if (currentUserId) {
            // Collect all visible comment IDs (parents + replies)
            const allIds: string[] = [];

            // Cast to known type to avoid inference issues with deep includes
            const typedComments = comments as unknown as CommentWithRelations[];

            typedComments.forEach((c) => {
                allIds.push(c.id);
                if (c.replies) {
                    c.replies.forEach((r) => allIds.push(r.id));
                }
            });

            if (allIds.length > 0) {
                const likes = await this.prisma.commentLike.findMany({
                    where: {
                        userId: currentUserId,
                        commentId: { in: allIds },
                    },
                    select: { commentId: true },
                });
                likedCommentIds = new Set(likes.map((l: { commentId: string }) => l.commentId));
            }
        }

        // Transform to DTO with nested replies
        const typedComments = comments as unknown as CommentWithRelations[];
        const data = typedComments.map((comment) => {
            const dto = this.toCommentDto(comment, likedCommentIds.has(comment.id));

            // Handle replies
            if (comment.replies) {
                dto.replies = comment.replies.map((reply) =>
                    this.toCommentDto(reply, likedCommentIds.has(reply.id))
                );
            }

            return dto;
        });

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Delete a comment
     */
    async delete(commentId: string, userId: string): Promise<void> {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.deletedAt) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        // Soft delete
        await this.prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });

        // Decrement blog comment count
        await this.prisma.blog.update({
            where: { id: comment.blogId },
            data: { commentCount: { decrement: 1 } },
        });

        this.logger.log(`Comment ${commentId} deleted by user ${userId}`);
    }

    /**
     * Like a comment
     */
    async like(commentId: string, userId: string): Promise<void> {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true, deletedAt: true },
        });

        if (!comment || comment.deletedAt) {
            throw new NotFoundException('Comment not found');
        }

        const existingLike = await this.prisma.commentLike.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (existingLike) {
            throw new ConflictException('Already liked');
        }

        await this.prisma.$transaction([
            this.prisma.commentLike.create({
                data: { userId, commentId },
            }),
            this.prisma.comment.update({
                where: { id: commentId },
                data: { likeCount: { increment: 1 } },
            }),
        ]);
    }

    /**
     * Unlike a comment
     */
    async unlike(commentId: string, userId: string): Promise<void> {
        const existingLike = await this.prisma.commentLike.findUnique({
            where: { userId_commentId: { userId, commentId } },
        });

        if (!existingLike) {
            throw new NotFoundException('Not liked');
        }

        await this.prisma.$transaction([
            this.prisma.commentLike.delete({
                where: { userId_commentId: { userId, commentId } },
            }),
            this.prisma.comment.update({
                where: { id: commentId },
                data: { likeCount: { decrement: 1 } },
            }),
        ]);
    }

    /**
     * Helper: Convert DB record to DTO
     */
    private toCommentDto(comment: CommentWithRelations, isLiked = false): CommentResponseDto {
        return {
            id: comment.id,
            content: comment.content,
            userId: comment.userId,
            blogId: comment.blogId,
            parentId: comment.parentId,
            likeCount: comment.likeCount,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            user: comment.user as CommentUserDto,
            isLiked,
            replies: [], // populated by caller if needed
        };
    }
}
