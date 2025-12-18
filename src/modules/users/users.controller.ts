import {
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { USERS_API } from './users.api';
import {
    UpdateProfileDto,
    PaginationQueryDto,
    UserProfileDto,
    PublicProfileDto,
    FollowUserDto,
    PaginatedResponseDto,
    FollowStatusDto,
} from './users.dto';
import { CurrentUser, Public } from '../../common/decorators';

@Controller(USERS_API.BASE)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * GET /users/profile
     * Get current user's profile (authenticated)
     */
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async getProfile(
        @CurrentUser('id') userId: string,
    ): Promise<{ data: UserProfileDto }> {
        const profile = await this.usersService.getProfile(userId);
        return { data: profile };
    }

    /**
     * PATCH /users/profile
     * Update current user's profile
     */
    @Patch('profile')
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateProfileDto,
    ): Promise<{ data: UserProfileDto; message: string }> {
        const profile = await this.usersService.updateProfile(userId, dto);
        return {
            data: profile,
            message: 'Profile updated successfully',
        };
    }

    /**
     * POST /users/upgrade-to-creator
     * Upgrade current user to creator role
     */
    @Post('upgrade-to-creator')
    @HttpCode(HttpStatus.OK)
    async upgradeToCreator(
        @CurrentUser('id') userId: string,
    ): Promise<{ data: UserProfileDto; message: string }> {
        const profile = await this.usersService.upgradeToCreator(userId);
        return {
            data: profile,
            message: 'Successfully upgraded to creator',
        };
    }

    /**
     * GET /users/:username
     * Get public profile by username (public route)
     */
    @Public()
    @Get(':username')
    @HttpCode(HttpStatus.OK)
    async getPublicProfile(
        @Param('username') username: string,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<{ data: PublicProfileDto }> {
        const profile = await this.usersService.getPublicProfile(
            username,
            currentUserId,
        );
        return { data: profile };
    }

    /**
     * POST /users/:userId/follow
     * Follow a user
     */
    @Post(':userId/follow')
    @HttpCode(HttpStatus.OK)
    async follow(
        @CurrentUser('id') currentUserId: string,
        @Param('userId') userId: string,
    ): Promise<{ message: string }> {
        await this.usersService.follow(currentUserId, userId);
        return { message: 'Successfully followed user' };
    }

    /**
     * DELETE /users/:userId/follow
     * Unfollow a user
     */
    @Delete(':userId/follow')
    @HttpCode(HttpStatus.OK)
    async unfollow(
        @CurrentUser('id') currentUserId: string,
        @Param('userId') userId: string,
    ): Promise<{ message: string }> {
        await this.usersService.unfollow(currentUserId, userId);
        return { message: 'Successfully unfollowed user' };
    }

    /**
     * GET /users/:userId/followers
     * Get followers of a user (public)
     */
    @Public()
    @Get(':userId/followers')
    @HttpCode(HttpStatus.OK)
    async getFollowers(
        @Param('userId') userId: string,
        @Query() query: PaginationQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedResponseDto<FollowUserDto>> {
        return this.usersService.getFollowers(
            userId,
            query.page,
            query.limit,
            currentUserId,
        );
    }

    /**
     * GET /users/:userId/following
     * Get users that a user is following (public)
     */
    @Public()
    @Get(':userId/following')
    @HttpCode(HttpStatus.OK)
    async getFollowing(
        @Param('userId') userId: string,
        @Query() query: PaginationQueryDto,
        @CurrentUser('id') currentUserId?: string,
    ): Promise<PaginatedResponseDto<FollowUserDto>> {
        return this.usersService.getFollowing(
            userId,
            query.page,
            query.limit,
            currentUserId,
        );
    }

    /**
     * GET /users/:userId/follow-status
     * Check if current user follows target user
     */
    @Get(':userId/follow-status')
    @HttpCode(HttpStatus.OK)
    async getFollowStatus(
        @CurrentUser('id') currentUserId: string,
        @Param('userId') userId: string,
    ): Promise<{ data: FollowStatusDto }> {
        const status = await this.usersService.getFollowStatus(currentUserId, userId);
        return { data: status };
    }
}
