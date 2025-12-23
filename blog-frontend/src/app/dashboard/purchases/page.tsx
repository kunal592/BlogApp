"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { paymentService, PurchaseHistory } from "@/services/payment.service";
import { Button } from "@/components/ui";

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPurchases = async () => {
            try {
                const data = await paymentService.getHistory();
                setPurchases(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load purchases");
            } finally {
                setLoading(false);
            }
        };
        loadPurchases();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-8 pb-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-8" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-subtle rounded-xl p-6 animate-pulse">
                                <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
                                <div className="h-4 w-1/4 bg-white/10 rounded" />
                            </div>
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
                    <h1 className="text-3xl font-bold">My Purchases</h1>
                    <p className="text-[var(--muted)] mt-1">Premium content you've purchased</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                )}

                {/* Purchases List */}
                {purchases.length === 0 ? (
                    <div className="text-center py-16 glass-subtle rounded-2xl">
                        <p className="text-4xl mb-4">📚</p>
                        <p className="text-[var(--muted)] mb-4">You haven't purchased any premium content yet.</p>
                        <Link href="/explore">
                            <Button variant="primary">Explore Content</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {purchases.map((purchase, index) => (
                            <motion.div
                                key={purchase.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-subtle rounded-xl p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <Link
                                            href={`/blog/${purchase.blogSlug}`}
                                            className="text-lg font-medium hover:text-[var(--accent)] transition-colors"
                                        >
                                            {purchase.blogTitle}
                                        </Link>
                                        <p className="text-sm text-[var(--muted)] mt-1">
                                            Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{purchase.amount}</p>
                                        <Link
                                            href={`/blog/${purchase.blogSlug}`}
                                            className="text-sm text-[var(--accent)] hover:underline"
                                        >
                                            Read →
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
