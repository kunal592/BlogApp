import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiCookieAuth,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NOTIFICATIONS_API } from './notifications.api';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationResponseDto, UnreadCountDto } from './notifications.dto';

@ApiTags('Notifications')
@Controller(NOTIFICATIONS_API.BASE)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    /**
     * GET /notifications
     * Get all notifications
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get notifications',
        description: 'Get list of notifications for current user.',
    })
    @ApiResponse({ status: 200, description: 'Notifications retrieved', type: [NotificationResponseDto] })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getAll(
        @CurrentUser('id') userId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ): Promise<{ data: NotificationResponseDto[]; meta: any }> {
        return this.notificationsService.findAll(userId, Number(page), Number(limit));
    }

    /**
     * GET /notifications/unread-count
     * Get unread count
     */
    @Get('unread-count')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get unread count',
        description: 'Get count of unread notifications.',
    })
    @ApiResponse({ status: 200, description: 'Count retrieved', type: UnreadCountDto })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async getUnreadCount(
        @CurrentUser('id') userId: string,
    ): Promise<{ data: UnreadCountDto }> {
        const count = await this.notificationsService.getUnreadCount(userId);
        return { data: { count } };
    }

    /**
     * PATCH /notifications/:id/read
     * Mark as read
     */
    @Patch(':id/read')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Mark as read',
        description: 'Mark a specific notification as read.',
    })
    @ApiResponse({ status: 200, description: 'Marked as read' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async markAsRead(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ): Promise<{ message: string }> {
        await this.notificationsService.markAsRead(id, userId);
        return { message: 'Marked as read' };
    }

    /**
     * PATCH /notifications/read-all
     * Mark all as read
     */
    @Patch('read-all')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Mark all as read',
        description: 'Mark all notifications as read.',
    })
    @ApiResponse({ status: 200, description: 'All marked as read' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async markAllAsRead(
        @CurrentUser('id') userId: string,
    ): Promise<{ message: string }> {
        await this.notificationsService.markAllAsRead(userId);
        return { message: 'All marked as read' };
    }
}
