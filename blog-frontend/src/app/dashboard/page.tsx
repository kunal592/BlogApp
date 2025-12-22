"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardOverview() {
    return (
        <div className="min-h-screen pt-8 pb-24 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-[var(--muted)] mt-1">Welcome back! Here's your overview.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <QuickStat label="Total Views" value="24.5K" change="+12%" />
                    <QuickStat label="Followers" value="1,234" change="+5%" />
                    <QuickStat label="Articles" value="18" />
                    <QuickStat label="This Month" value="₹8,750" change="+24%" />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Link href="/write" className="glass-subtle rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                        <span className="text-3xl mb-4 block">✍️</span>
                        <h3 className="text-lg font-semibold">Write New Article</h3>
                        <p className="text-sm text-[var(--muted)] mt-1">Share your thoughts with the world</p>
                    </Link>
                    <Link href="/dashboard/earnings" className="glass-subtle rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                        <span className="text-3xl mb-4 block">💰</span>
                        <h3 className="text-lg font-semibold">View Earnings</h3>
                        <p className="text-sm text-[var(--muted)] mt-1">Track revenue and manage payouts</p>
                    </Link>
                </div>

                {/* Recent Articles */}
                <div className="glass-subtle rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Recent Articles</h2>
                        <Link href="/dashboard/articles" className="text-sm text-[var(--accent)] hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: "The Future of AI Content Creation", views: "4.2K", earnings: "₹2,450" },
                            { title: "Building in Public: A Journey", views: "3.1K", earnings: "₹1,800" },
                            { title: "Design Systems That Scale", views: "2.8K", earnings: "₹1,200" },
                        ].map((article, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="font-medium">{article.title}</p>
                                    <p className="text-sm text-[var(--muted)]">{article.views} views</p>
                                </div>
                                <p className="text-[var(--accent)] font-medium">{article.earnings}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickStat({ label, value, change }: { label: string; value: string; change?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-subtle rounded-2xl p-5"
        >
            <p className="text-sm text-[var(--muted)]">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
                <p className={`text-xs mt-1 ${change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                    {change}
                </p>
            )}
        </motion.div>
    );
}
