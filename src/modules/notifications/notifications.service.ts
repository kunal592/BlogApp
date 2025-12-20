import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationResponseDto } from './notifications.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

interface CreateNotificationParams {
    userId: string; // Recipient
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    ) { }

    /**
     * Internal: Create a new notification (Async via Queue)
     */
    async create(params: CreateNotificationParams): Promise<void> {
        try {
            await this.notificationsQueue.add('send-notification', params, {
                removeOnComplete: true,
                attempts: 3,
            });
        } catch (error) {
            this.logger.error('Failed to add notification to queue', error);
        }
    }

    /**
     * Get all notifications for a user
     */
    async findAll(userId: string, page = 1, limit = 20): Promise<{ data: NotificationResponseDto[]; meta: any }> {
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);

        const data = notifications.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            data: n.data,
            isRead: n.isRead,
            createdAt: n.createdAt,
        }));

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
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(id: string, userId: string): Promise<void> {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.userId !== userId) {
            // Silently fail or throw? Throw is better for API
            throw new NotFoundException('Notification not found');
        }

        await this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}
