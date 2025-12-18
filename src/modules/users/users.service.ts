import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    UpdateProfileDto,
    UserProfileDto,
    PublicProfileDto,
    FollowUserDto,
    PaginatedResponseDto,
    FollowStatusDto,
} from './users.dto';
import { MESSAGES } from '../../common/constants';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get current user's full profile
     */
    async getProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt) {
            throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
        }

        return this.toUserProfileDto(user);
    }

    /**
     * Update current user's profile
     */
    async updateProfile(
        userId: string,
        dto: UpdateProfileDto,
    ): Promise<UserProfileDto> {
        // Check if username is already taken
        if (dto.username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username: dto.username },
            });

            if (existingUser && existingUser.id !== userId) {
                throw new ConflictException('Username is already taken');
            }
        }

        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.username && { username: dto.username }),
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.bio !== undefined && { bio: dto.bio }),
                ...(dto.avatar !== undefined && { avatar: dto.avatar }),
            },
        });

        this.logger.log(`User ${userId} updated their profile`);

        return this.toUserProfileDto(user);
    }

    /**
     * Get public profile by username
     */
    async getPublicProfile(
        username: string,
        currentUserId?: string,
    ): Promise<PublicProfileDto> {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });

        if (!user || user.deletedAt || !user.isActive) {
            throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
        }

        // Check if current user follows this user
        let isFollowing = false;
        if (currentUserId && currentUserId !== user.id) {
            const follow = await this.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id,
                    },
                },
            });
            isFollowing = !!follow;
        }

        return this.toPublicProfileDto(user, isFollowing);
    }

    /**
     * Get public profile by ID
     */
    async getPublicProfileById(
        userId: string,
        currentUserId?: string,
    ): Promise<PublicProfileDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deletedAt || !user.isActive) {
            throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
        }

        // Check if current user follows this user
        let isFollowing = false;
        if (currentUserId && currentUserId !== user.id) {
            const follow = await this.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id,
                    },
                },
            });
            isFollowing = !!follow;
        }

        return this.toPublicProfileDto(user, isFollowing);
    }

    /**
     * Follow a user
     */
    async follow(followerId: string, followingId: string): Promise<void> {
        if (followerId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        // Check if target user exists
        const targetUser = await this.prisma.user.findUnique({
            where: { id: followingId },
        });

        if (!targetUser || targetUser.deletedAt || !targetUser.isActive) {
            throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
        }

        // Check if already following
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            throw new ConflictException('You are already following this user');
        }

        // Create follow and update counts in a transaction
        await this.prisma.$transaction([
            this.prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                },
            }),
            this.prisma.user.update({
                where: { id: followerId },
                data: { followingCount: { increment: 1 } },
            }),
            this.prisma.user.update({
                where: { id: followingId },
                data: { followerCount: { increment: 1 } },
            }),
        ]);

        this.logger.log(`User ${followerId} followed user ${followingId}`);
    }

    /**
     * Unfollow a user
     */
    async unfollow(followerId: string, followingId: string): Promise<void> {
        if (followerId === followingId) {
            throw new BadRequestException('You cannot unfollow yourself');
        }

        // Check if follow exists
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (!existingFollow) {
            throw new NotFoundException('You are not following this user');
        }

        // Delete follow and update counts in a transaction
        await this.prisma.$transaction([
            this.prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            }),
            this.prisma.user.update({
                where: { id: followerId },
                data: { followingCount: { decrement: 1 } },
            }),
            this.prisma.user.update({
                where: { id: followingId },
                data: { followerCount: { decrement: 1 } },
            }),
        ]);

        this.logger.log(`User ${followerId} unfollowed user ${followingId}`);
    }

    /**
     * Get followers of a user
     */
    async getFollowers(
        userId: string,
        page: number = 1,
        limit: number = 20,
        currentUserId?: string,
    ): Promise<PaginatedResponseDto<FollowUserDto>> {
        const skip = (page - 1) * limit;

        const [followers, total] = await Promise.all([
            this.prisma.follow.findMany({
                where: { followingId: userId },
                include: { follower: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.follow.count({ where: { followingId: userId } }),
        ]);

        // Check which followers the current user is following
        let followingMap = new Map<string, boolean>();
        if (currentUserId) {
            const following = await this.prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: { in: followers.map((f) => f.followerId) },
                },
            });
            followingMap = new Map(following.map((f) => [f.followingId, true]));
        }

        return {
            data: followers.map((f) => ({
                id: f.follower.id,
                username: f.follower.username,
                name: f.follower.name,
                avatar: f.follower.avatar,
                bio: f.follower.bio,
                isVerified: f.follower.isVerified,
                isFollowing: followingMap.get(f.follower.id) || false,
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
     * Get users that a user is following
     */
    async getFollowing(
        userId: string,
        page: number = 1,
        limit: number = 20,
        currentUserId?: string,
    ): Promise<PaginatedResponseDto<FollowUserDto>> {
        const skip = (page - 1) * limit;

        const [following, total] = await Promise.all([
            this.prisma.follow.findMany({
                where: { followerId: userId },
                include: { following: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.follow.count({ where: { followerId: userId } }),
        ]);

        // Check which followed users the current user is following
        let followingMap = new Map<string, boolean>();
        if (currentUserId) {
            const currentUserFollowing = await this.prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: { in: following.map((f) => f.followingId) },
                },
            });
            followingMap = new Map(
                currentUserFollowing.map((f) => [f.followingId, true]),
            );
        }

        return {
            data: following.map((f) => ({
                id: f.following.id,
                username: f.following.username,
                name: f.following.name,
                avatar: f.following.avatar,
                bio: f.following.bio,
                isVerified: f.following.isVerified,
                isFollowing:
                    currentUserId === userId
                        ? true
                        : followingMap.get(f.following.id) || false,
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
     * Check follow status
     */
    async getFollowStatus(
        followerId: string,
        followingId: string,
    ): Promise<FollowStatusDto> {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        return {
            isFollowing: !!follow,
            followedAt: follow?.createdAt,
        };
    }

    /**
     * Upgrade user to creator role
     */
    async upgradeToCreator(userId: string): Promise<UserProfileDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(MESSAGES.USER.NOT_FOUND);
        }

        if (
            user.role === 'CREATOR' ||
            user.role === 'ADMIN' ||
            user.role === 'OWNER'
        ) {
            throw new BadRequestException('User is already a creator or higher role');
        }

        // Require username for creators
        if (!user.username) {
            throw new BadRequestException(
                'Please set a username before becoming a creator',
            );
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'CREATOR' },
        });

        this.logger.log(`User ${userId} upgraded to CREATOR role`);

        return this.toUserProfileDto(updatedUser);
    }

    /**
     * Convert user entity to profile DTO
     */
    private toUserProfileDto(user: {
        id: string;
        username: string | null;
        email: string;
        name: string | null;
        bio: string | null;
        avatar: string | null;
        role: string;
        isVerified: boolean;
        followerCount: number;
        followingCount: number;
        createdAt: Date;
    }): UserProfileDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role as UserProfileDto['role'],
            isVerified: user.isVerified,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            createdAt: user.createdAt,
        };
    }

    /**
     * Convert user entity to public profile DTO
     */
    private toPublicProfileDto(
        user: {
            id: string;
            username: string | null;
            name: string | null;
            bio: string | null;
            avatar: string | null;
            role: string;
            isVerified: boolean;
            followerCount: number;
            followingCount: number;
            createdAt: Date;
        },
        isFollowing?: boolean,
    ): PublicProfileDto {
        return {
            id: user.id,
            username: user.username,
            name: user.name,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role as PublicProfileDto['role'],
            isVerified: user.isVerified,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            createdAt: user.createdAt,
            isFollowing,
        };
    }
}
