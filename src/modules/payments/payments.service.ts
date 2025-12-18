import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
    Inject,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import paymentConfig from '../../config/payment.config';
import { PrismaService } from '../../prisma/prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import {
    CreateOrderDto,
    VerifyPaymentDto,
    OrderResponseDto,
    PurchaseHistoryDto,
} from './payments.dto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private razorpay: Razorpay | null = null;
    private isEnabled = false;

    constructor(
        private readonly prisma: PrismaService,
        @Inject(paymentConfig.KEY)
        private readonly config: ConfigType<typeof paymentConfig>,
    ) {
        if (this.config.razorpay.keyId && this.config.razorpay.keySecret) {
            this.razorpay = new Razorpay({
                key_id: this.config.razorpay.keyId,
                key_secret: this.config.razorpay.keySecret,
            });
            this.isEnabled = true;
            this.logger.log('Razorpay initialized');
        } else {
            this.logger.warn('Razorpay keys not configured. Payments will fail.');
        }
    }

    private getRazorpay(): Razorpay {
        if (!this.isEnabled || !this.razorpay) {
            throw new BadRequestException('Payment gateway not configured');
        }
        return this.razorpay;
    }

    /**
     * Create a Razorpay order for a blog Purchase
     */
    async createOrder(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
        const razorpay = this.getRazorpay();

        const blog = await this.prisma.blog.findUnique({
            where: { id: dto.blogId },
        });

        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        if (!blog.isExclusive) {
            throw new BadRequestException('This blog is free and cannot be purchased');
        }

        if (!blog.price || blog.price <= 0) {
            throw new BadRequestException('Invalid blog price');
        }

        // Check if already purchased
        const existingPurchase = await this.prisma.purchase.findUnique({
            where: { userId_blogId: { userId, blogId: dto.blogId } },
        });

        if (existingPurchase && existingPurchase.status === 'COMPLETED') {
            throw new BadRequestException('You have already purchased this blog');
        }

        // Amount in paise (assuming blog.price is in INR)
        const amountInPaise = blog.price * 100;
        const currency = 'INR';

        try {
            const options = {
                amount: amountInPaise,
                currency,
                receipt: `receipt_${userId.substring(0, 5)}_${Date.now()}`,
                notes: {
                    userId,
                    blogId: dto.blogId,
                },
            };

            const order = await razorpay.orders.create(options);

            // Save pending purchase
            if (existingPurchase) {
                await this.prisma.purchase.update({
                    where: { id: existingPurchase.id },
                    data: {
                        orderId: order.id,
                        amount: amountInPaise,
                        currency,
                        status: 'PENDING',
                    },
                });
            } else {
                await this.prisma.purchase.create({
                    data: {
                        userId,
                        blogId: dto.blogId,
                        amount: amountInPaise,
                        currency,
                        orderId: order.id,
                        status: 'PENDING',
                    },
                });
            }

            return {
                id: order.id,
                amount: Number(order.amount),
                currency: order.currency,
                key_id: this.config.razorpay.keyId,
            };
        } catch (error) {
            this.logger.error('Failed to create Razorpay order', error);
            throw new BadRequestException('Failed to create payment order');
        }
    }

    /**
     * Verify Razorpay payment signature
     */
    async verifyPayment(userId: string, dto: VerifyPaymentDto): Promise<{ success: boolean }> {
        // We don't need Razorpay instance to verify signature, just the secret
        if (!this.config.razorpay.keySecret) {
            throw new BadRequestException('Payment configuration missing');
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

        const purchase = await this.prisma.purchase.findUnique({
            where: { orderId: razorpay_order_id },
        });

        if (!purchase) {
            throw new NotFoundException('Order not found');
        }

        if (purchase.userId !== userId) {
            throw new BadRequestException('Order does not belong to user');
        }

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', this.config.razorpay.keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            await this.prisma.purchase.update({
                where: { id: purchase.id },
                data: { status: 'FAILED' },
            });
            throw new BadRequestException('Invalid payment signature');
        }

        // Mark as completed
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                status: 'COMPLETED',
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
            },
        });

        this.logger.log(`Payment confirmed for user ${userId}, blog ${purchase.blogId}`);

        return { success: true };
    }

    /**
     * Get purchase history
     */
    async getHistory(userId: string): Promise<PurchaseHistoryDto[]> {
        const purchases = await this.prisma.purchase.findMany({
            where: {
                userId,
                status: 'COMPLETED',
            },
            include: {
                blog: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return purchases.map((p) => ({
            id: p.id,
            amount: p.amount / 100, // Convert back to INR
            currency: p.currency,
            status: p.status,
            createdAt: p.createdAt,
            blog: p.blog,
        }));
    }
}
