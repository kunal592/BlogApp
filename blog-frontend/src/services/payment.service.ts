import { api } from '@/lib/api-client';

export interface CreateOrderDto {
    blogId: string;
    amount: number;
}

export interface OrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
}

export interface VerifyPaymentDto {
    orderId: string;
    paymentId: string;
    signature: string;
}

export interface PurchaseHistory {
    id: string;
    blogId: string;
    blogTitle: string;
    blogSlug: string;
    amount: number;
    purchasedAt: string;
}

export const paymentService = {
    async createOrder(dto: CreateOrderDto): Promise<OrderResponse> {
        const response = await api.post<{ data: OrderResponse }>('/payments/order', dto);
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
