"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaywallProps {
    price: number;
    currency?: string;
    title: string;
    author: string;
    previewContent: string;
    onPurchase: () => Promise<void>;
    isPurchased?: boolean;
    children: React.ReactNode;
}

export function Paywall({
    price,
    currency = "₹",
    title,
    author,
    previewContent,
    onPurchase,
    isPurchased = false,
    children,
}: PaywallProps) {
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [unlocked, setUnlocked] = useState(isPurchased);

    const handlePurchase = async () => {
        setIsUnlocking(true);
        try {
            await onPurchase();
            setUnlocked(true);
        } finally {
            setIsUnlocking(false);
        }
    };

    if (unlocked) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className="relative">
            {/* Preview with blur */}
            <div className="relative">
                <div
                    className="prose-custom text-lg text-[var(--foreground)]/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0C]/80 to-[#0B0B0C]" />
            </div>

            {/* Paywall Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative -mt-32 mx-auto max-w-lg"
            >
                <div className="glass p-8 rounded-2xl text-center">
                    {/* Lock Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                        <span className="text-3xl">🔒</span>
                    </div>

                    <h3 className="text-2xl font-semibold mb-2">
                        This is exclusive content
                    </h3>
                    <p className="text-[var(--muted)] mb-6">
                        Support {author} and unlock the full article
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                        <span className="text-4xl font-bold">
                            {currency}{price}
                        </span>
                        <span className="text-[var(--muted)] ml-2">one-time</span>
                    </div>

                    {/* Benefits */}
                    <ul className="text-left space-y-3 mb-8">
                        {[
                            "Full article access forever",
                            "Support the creator directly",
                            "70% goes to the author",
                        ].map((benefit, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-[var(--muted)]">
                                <span className="text-[var(--accent)]">✓</span>
                                {benefit}
                            </li>
                        ))}
                    </ul>

                    {/* Purchase Button */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePurchase}
                        disabled={isUnlocking}
                        className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-semibold disabled:opacity-50"
                    >
                        {isUnlocking ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⟳</span> Processing...
                            </span>
                        ) : (
                            `Unlock for ${currency}${price}`
                        )}
                    </motion.button>

                    <p className="mt-4 text-xs text-white/30">
                        Secure payment via Razorpay
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// Razorpay Payment Handler
interface RazorpayOptions {
    amount: number; // in paise
    currency: string;
    blogId: string;
    onSuccess: (paymentId: string) => void;
    onError: (error: string) => void;
}

export function useRazorpayCheckout() {
    const openCheckout = async ({
        amount,
        currency,
        blogId,
        onSuccess,
        onError,
    }: RazorpayOptions) => {
        // Load Razorpay script if not loaded
        if (!(window as any).Razorpay) {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            document.body.appendChild(script);
            await new Promise((resolve) => (script.onload = resolve));
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount,
            currency,
            name: "Premium Blog",
            description: "Unlock exclusive content",
            handler: function (response: any) {
                onSuccess(response.razorpay_payment_id);
            },
            prefill: {
                email: "", // TODO: Get from auth
            },
            theme: {
                color: "#5E9EFF",
            },
            modal: {
                ondismiss: function () {
                    onError("Payment cancelled");
                },
            },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
    };

    return { openCheckout };
}
