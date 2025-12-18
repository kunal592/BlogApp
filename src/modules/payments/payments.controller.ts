import {
    Controller,
    Post,
    Get,
    Body,
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
import { PaymentsService } from './payments.service';
import { PAYMENTS_API } from './payments.api';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
    CreateOrderDto,
    VerifyPaymentDto,
    OrderResponseDto,
    PurchaseHistoryDto,
} from './payments.dto';

@ApiTags('Payments')
@Controller(PAYMENTS_API.BASE)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * POST /payments/order
     * Create Razorpay order
     */
    @Post('order')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Create payment order',
        description: 'Initiate a purchase for an exclusive blog.',
    })
    @ApiResponse({ status: 200, description: 'Order created', type: OrderResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async createOrder(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateOrderDto,
    ): Promise<{ data: OrderResponseDto }> {
        const result = await this.paymentsService.createOrder(userId, dto);
        return { data: result };
    }

    /**
     * POST /payments/verify
     * Verify payment
     */
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Verify payment',
        description: 'Verify Razorpay signature and complete purchase.',
    })
    @ApiResponse({ status: 200, description: 'Payment verified' })
    @ApiResponse({ status: 400, description: 'Invalid signature' })
    @ApiResponse({ status: 401, description: 'Not authenticated' })
    async verifyPayment(
        @CurrentUser('id') userId: string,
        @Body() dto: VerifyPaymentDto,
    ): Promise<{ message: string; success: boolean }> {
        await this.paymentsService.verifyPayment(userId, dto);
        return { message: 'Payment verified successfully', success: true };
    }

    /**
     * GET /payments/history
     * Get purchase history
     */
    @Get('history')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('access_token')
    @ApiBearerAuth('bearer')
    @ApiOperation({
        summary: 'Get purchase history',
        description: 'Get list of purchased blogs.',
    })
    @ApiResponse({ status: 200, description: 'History retrieved', type: [PurchaseHistoryDto] })
    async getHistory(
        @CurrentUser('id') userId: string,
    ): Promise<{ data: PurchaseHistoryDto[] }> {
        const data = await this.paymentsService.getHistory(userId);
        return { data };
    }
}
