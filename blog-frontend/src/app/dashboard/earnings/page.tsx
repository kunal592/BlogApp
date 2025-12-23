"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { paymentService, CreatorEarnings, EarningItem } from "@/services/payment.service";
import { useAuthStore } from "@/store/auth.store";

function formatCurrency(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function EarningsPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isCreator = user?.role === 'CREATOR' || user?.role === 'ADMIN' || user?.role === 'OWNER';

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!isAuthenticated || !isCreator) {
                setLoading(false);
                return;
            }

            try {
                const data = await paymentService.getEarnings();
                setEarnings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load earnings");
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, [isAuthenticated, isCreator]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Login Required</h1>
                    <p className="text-[var(--muted)] mb-4">Please login to view your earnings</p>
                    <Link href="/login" className="text-[var(--accent)] hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (!isCreator) {
        return (
            <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--card-bg)] flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Become a Creator</h1>
                    <p className="text-[var(--muted)] mb-6 max-w-md">
                        Upgrade to a creator account to publish premium blogs and start earning
                    </p>
                    <Link
                        href="/dashboard/settings"
                        className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                        Upgrade Now
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-8 pb-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="h-8 w-48 bg-[var(--card-bg)] rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-[var(--card-bg)] rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-8 pb-24 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Earnings</h1>
                    <p className="text-[var(--muted)] mt-1">
                        Track your revenue from premium content sales
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                        {error}
                    </div>
                )}

                {earnings && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-6 rounded-2xl"
                            >
                                <div className="text-[var(--muted)] text-sm mb-1">💰 Total Earnings</div>
                                <div className="text-3xl font-bold text-green-400">
                                    {formatCurrency(earnings.totalEarnings)}
                                </div>
                                <div className="text-xs text-[var(--muted)] mt-2">
                                    After {earnings.platformFeePercent}% platform fee
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass p-6 rounded-2xl"
                            >
                                <div className="text-[var(--muted)] text-sm mb-1">📈 Total Sales</div>
                                <div className="text-3xl font-bold">
                                    {earnings.totalSales}
                                </div>
                                <div className="text-xs text-[var(--muted)] mt-2">
                                    Premium blog purchases
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass p-6 rounded-2xl"
                            >
                                <div className="text-[var(--muted)] text-sm mb-1">🏢 Platform Fees</div>
                                <div className="text-3xl font-bold text-[var(--muted)]">
                                    {formatCurrency(earnings.platformFees)}
                                </div>
                                <div className="text-xs text-[var(--muted)] mt-2">
                                    {earnings.platformFeePercent}% of gross revenue
                                </div>
                            </motion.div>
                        </div>

                        {/* Revenue Split Visualization */}
                        <div className="glass p-6 rounded-2xl mb-8">
                            <h2 className="font-semibold mb-4">Revenue Split</h2>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1 h-6 bg-[var(--card-bg)] rounded-full overflow-hidden flex">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${100 - earnings.platformFeePercent}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                                    />
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${earnings.platformFeePercent}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-gray-500 to-gray-600"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-green-400">
                                        You earn: {100 - earnings.platformFeePercent}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                                    <span className="text-[var(--muted)]">
                                        Platform: {earnings.platformFeePercent}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sales History */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Sales History</h2>

                            {earnings.earnings.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-16 glass rounded-2xl"
                                >
                                    <div className="w-20 h-20 rounded-full bg-[var(--card-bg)] flex items-center justify-center mx-auto mb-6">
                                        <span className="text-4xl">💸</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">No sales yet</h3>
                                    <p className="text-[var(--muted)] mb-6">
                                        Create premium blogs to start earning
                                    </p>
                                    <Link
                                        href="/write"
                                        className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Write a Premium Blog
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {earnings.earnings.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="glass p-5 rounded-xl flex items-center justify-between"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/blog/${item.blog.slug}`}
                                                    className="font-medium hover:text-[var(--accent)] transition-colors block truncate"
                                                >
                                                    {item.blog.title}
                                                </Link>
                                                <div className="text-sm text-[var(--muted)] mt-1">
                                                    Purchased by <span className="font-medium">{item.buyer.name || item.buyer.username || 'Anonymous'}</span>
                                                    <span className="mx-2">•</span>
                                                    {formatDate(item.createdAt)}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4 shrink-0">
                                                <div className="text-green-400 font-bold text-lg">
                                                    +{formatCurrency(item.netAmount)}
                                                </div>
                                                <div className="text-xs text-[var(--muted)]">
                                                    Gross: {formatCurrency(item.grossAmount)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Payout Info */}
                        <div className="mt-8 p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                            <p className="text-sm text-[var(--muted)]">
                                <strong className="text-[var(--foreground)]">💡 Payout Info:</strong> Earnings are credited to your wallet after each sale.
                                Minimum withdrawal amount is ₹500. Contact support for payout requests.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
