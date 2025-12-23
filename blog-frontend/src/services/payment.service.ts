import { api } from '@/lib/api-client';

export interface OrderResponse {
    id: string;         // Razorpay order ID
    amount: number;     // Amount in paise
    currency: string;   // 'INR'
    key_id: string;     // Razorpay key ID for frontend
}

export interface VerifyPaymentDto {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface PurchaseHistory {
    id: string;
    blogId: string;
    blogTitle: string;
    blogSlug: string;
    amount: number;
    purchasedAt: string;
    status: string;
}

export const paymentService = {
    async createOrder(blogId: string): Promise<OrderResponse> {
        const response = await api.post<{ data: OrderResponse }>('/payments/order', { blogId });
        return response.data;
    },

    async verifyPayment(dto: VerifyPaymentDto): Promise<boolean> {
        const response = await api.post<{ success: boolean }>('/payments/verify', dto);
        return response.success;
    },

    async getHistory(): Promise<PurchaseHistory[]> {
        const response = await api.get<{ data: PurchaseHistory[] }>('/payments/history');
        return response.data;
    },
};
