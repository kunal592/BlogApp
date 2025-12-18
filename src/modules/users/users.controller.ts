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
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiCookieAuth,
    ApiBearerAuth,
} from '@nestjs/swagger';
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

@ApiTags('Users')
@Controller(USERS_API.BASE)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * GET /users/profile
     * Get current user's profile (authenticated)
     */
    @Get('profile')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Get the full profile of the currently authenticated user',
    })
    @ApiResponse({
        status: 200,
        description: 'Profile retrieved successfully',
        type: UserProfileDto,
    })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
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
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Update current user profile',
        description: 'Update profile fields like username, name, bio, avatar',
    })
    @ApiResponse({
        status: 200,
        description: 'Profile updated successfully',
        type: UserProfileDto,
    })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 409, description: 'Username already taken' })
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
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Upgrade to creator',
        description:
            'Upgrade current user to creator role. Requires username to be set first.',
    })
    @ApiResponse({
        status: 200,
        description: 'Successfully upgraded to creator',
        type: UserProfileDto,
    })
    @ApiResponse({ status: 400, description: 'Username not set or already a creator' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
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
    @ApiOperation({
        summary: 'Get public profile by username',
        description:
            'Get public profile of a user. If authenticated, includes follow status.',
    })
    @ApiParam({ name: 'username', description: 'Username to look up' })
    @ApiResponse({
        status: 200,
        description: 'Profile retrieved',
        type: PublicProfileDto,
    })
    @ApiResponse({ status: 404, description: 'User not found' })
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
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Follow a user',
        description: 'Start following another user',
    })
    @ApiParam({ name: 'userId', description: 'User ID to follow' })
    @ApiResponse({ status: 200, description: 'Successfully followed user' })
    @ApiResponse({ status: 400, description: 'Cannot follow yourself' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'Already following this user' })
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
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Unfollow a user',
        description: 'Stop following another user',
    })
    @ApiParam({ name: 'userId', description: 'User ID to unfollow' })
    @ApiResponse({ status: 200, description: 'Successfully unfollowed user' })
    @ApiResponse({ status: 400, description: 'Cannot unfollow yourself' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    @ApiResponse({ status: 404, description: 'Not following this user' })
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
    @ApiOperation({
        summary: 'Get followers',
        description: 'Get paginated list of users following this user',
    })
    @ApiParam({ name: 'userId', description: 'User ID to get followers for' })
    @ApiResponse({
        status: 200,
        description: 'Followers list retrieved',
    })
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
    @ApiOperation({
        summary: 'Get following',
        description: 'Get paginated list of users this user follows',
    })
    @ApiParam({ name: 'userId', description: 'User ID to get following for' })
    @ApiResponse({
        status: 200,
        description: 'Following list retrieved',
    })
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
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Check follow status',
        description: 'Check if current user follows the specified user',
    })
    @ApiParam({ name: 'userId', description: 'User ID to check follow status for' })
    @ApiResponse({
        status: 200,
        description: 'Follow status retrieved',
        type: FollowStatusDto,
    })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getFollowStatus(
        @CurrentUser('id') currentUserId: string,
        @Param('userId') userId: string,
    ): Promise<{ data: FollowStatusDto }> {
        const status = await this.usersService.getFollowStatus(currentUserId, userId);
        return { data: status };
    }
}
