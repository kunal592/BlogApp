"use client";

import { motion } from "framer-motion";

export default function AnalyticsPage() {
    // Mock data - replace with real API calls
    const stats = [
        { label: "Total Views", value: "12.5K", change: "+18%", period: "vs last month" },
        { label: "Unique Readers", value: "8.2K", change: "+12%", period: "vs last month" },
        { label: "Avg. Read Time", value: "4:32", change: "+8%", period: "vs last month" },
        { label: "Engagement Rate", value: "24%", change: "+5%", period: "vs last month" },
    ];

    const topArticles = [
        { title: "The Future of AI-Powered Content", views: 4520, trend: "+12%" },
        { title: "Building in Public: A Journey", views: 3280, trend: "+8%" },
        { title: "Design Systems That Scale", views: 2140, trend: "+15%" },
        { title: "Remote Work Productivity", views: 1890, trend: "-3%" },
        { title: "Web3 Reality Check", views: 1420, trend: "+22%" },
    ];

    const trafficSources = [
        { source: "Direct", percentage: 35 },
        { source: "Search", percentage: 28 },
        { source: "Social", percentage: 22 },
        { source: "Referral", percentage: 15 },
    ];

    return (
        <div className="min-h-screen pt-8 pb-24 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-[var(--muted)] mt-1">Track your content performance</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-subtle rounded-xl p-6"
                        >
                            <p className="text-sm text-[var(--muted)] mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                            <p className="text-sm mt-2">
                                <span className={stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                                    {stat.change}
                                </span>
                                <span className="text-[var(--muted)]"> {stat.period}</span>
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Articles */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-subtle rounded-xl p-6"
                    >
                        <h2 className="text-xl font-semibold mb-4">Top Articles</h2>
                        <div className="space-y-4">
                            {topArticles.map((article, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[var(--muted)] w-6">{index + 1}.</span>
                                        <span className="truncate">{article.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-[var(--muted)]">{article.views.toLocaleString()} views</span>
                                        <span className={article.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                                            {article.trend}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Traffic Sources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-subtle rounded-xl p-6"
                    >
                        <h2 className="text-xl font-semibold mb-4">Traffic Sources</h2>
                        <div className="space-y-4">
                            {trafficSources.map((source) => (
                                <div key={source.source}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{source.source}</span>
                                        <span className="text-[var(--muted)]">{source.percentage}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${source.percentage}%` }}
                                            transition={{ delay: 0.6, duration: 0.5 }}
                                            className="h-full bg-[var(--accent)] rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Chart placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-subtle rounded-xl p-6 mt-6"
                >
                    <h2 className="text-xl font-semibold mb-4">Views Over Time</h2>
                    <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg">
                        <p className="text-[var(--muted)]">📊 Chart coming soon...</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
