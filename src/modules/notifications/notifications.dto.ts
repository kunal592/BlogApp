import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for a notification
 */
export class NotificationResponseDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 'LIKE' })
    type!: string;

    @ApiProperty({ example: 'Someone liked your blog' })
    title!: string;

    @ApiProperty({ example: 'John Doe liked "How into Tech"' })
    message!: string;

    @ApiProperty({
        example: { blogId: 'xyz', actorId: 'abc' },
        required: false
    })
    data?: any;

    @ApiProperty({ example: false })
    isRead!: boolean;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt!: Date;
}

/**
 * Response for count
 */
export class UnreadCountDto {
    @ApiProperty({ example: 5 })
    count!: number;
}
