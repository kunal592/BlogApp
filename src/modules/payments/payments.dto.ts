import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO to create a payment order
 */
export class CreateOrderDto {
    @ApiProperty({
        example: 'clxxxxxxxxxxxxxxxxxx',
        description: 'ID of the blog to purchase',
    })
    @IsString()
    @IsNotEmpty()
    blogId!: string;
}

/**
 * DTO to verify payment
 */
export class VerifyPaymentDto {
    @ApiProperty({
        example: 'order_xxxxxxxxxxxxxx',
        description: 'Razorpay Order ID',
    })
    @IsString()
    @IsNotEmpty()
    razorpay_order_id!: string;

    @ApiProperty({
        example: 'pay_xxxxxxxxxxxxxx',
        description: 'Razorpay Payment ID',
    })
    @IsString()
    @IsNotEmpty()
    razorpay_payment_id!: string;

    @ApiProperty({
        example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'Razorpay Signature',
    })
    @IsString()
    @IsNotEmpty()
    razorpay_signature!: string;
}

/**
 * Response for order creation
 */
export class OrderResponseDto {
    @ApiProperty({ example: 'order_xxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 50000 })
    amount!: number; // paise

    @ApiProperty({ example: 'INR' })
    currency!: string;

    @ApiProperty({ example: 'rzp_test_xxxxxxxx' })
    key_id!: string; // Public key for frontend
}

/**
 * Response for purchase history
 */
export class PurchaseHistoryDto {
    @ApiProperty({ example: 'clxxxxxxxxxxxxxxxxxx' })
    id!: string;

    @ApiProperty({ example: 499 })
    amount!: number;

    @ApiProperty({ example: 'INR' })
    currency!: string;

    @ApiProperty({ example: 'COMPLETED' })
    status!: string;

    @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({
        type: 'object',
        properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
        }
    })
    blog!: {
        id: string;
        title: string;
        slug: string;
    };
}
