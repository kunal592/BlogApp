import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface NotificationJobData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
}

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
    private readonly logger = new Logger(NotificationsProcessor.name);

    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async process(job: Job<NotificationJobData, any, string>): Promise<any> {
        this.logger.debug(`Processing notification job ${job.id} for user ${job.data.userId}`);

        try {
            await this.prisma.notification.create({
                data: {
                    userId: job.data.userId,
                    type: job.data.type,
                    title: job.data.title,
                    message: job.data.message,
                    data: job.data.data || {},
                },
            });

            this.logger.log(`Notification sent to ${job.data.userId}: ${job.data.title}`);
            // Future: Send Email / Push Notification here
        } catch (error) {
            this.logger.error(`Failed to process notification ${job.id}`, error);
            throw error;
        }
    }
}
