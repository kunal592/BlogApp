import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
    provider: 'razorpay',

    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    },

    // Token system configuration
    tokens: {
        defaultTokenPrice: parseFloat(process.env.TOKEN_PRICE || '1.00'), // INR per token
        minPurchase: parseInt(process.env.MIN_TOKEN_PURCHASE || '100', 10),
        maxPurchase: parseInt(process.env.MAX_TOKEN_PURCHASE || '10000', 10),
    },

    // Creator payouts
    payout: {
        minAmount: parseFloat(process.env.MIN_PAYOUT_AMOUNT || '500.00'), // INR
        platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || '20'), // 20%
    },
}));
