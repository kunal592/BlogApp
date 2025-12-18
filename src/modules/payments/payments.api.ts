/**
 * Payments API Contract
 * 
 * This file defines all payment-related endpoints.
 * Both frontend and backend MUST import from this file.
 */

export const PAYMENTS_API = {
    // Base path for all payment routes
    BASE: 'payments',

    // Endpoints
    CREATE_ORDER: {
        method: 'POST',
        path: '/payments/order',
        description: 'Create a Razorpay order for blog purchase',
    },

    VERIFY_PAYMENT: {
        method: 'POST',
        path: '/payments/verify',
        description: 'Verify Razorpay payment signature and unlock content',
    },

    GET_HISTORY: {
        method: 'GET',
        path: '/payments/history',
        description: 'Get purchase history for current user',
    },
} as const;

export type PaymentEndpoint = keyof typeof PAYMENTS_API;
