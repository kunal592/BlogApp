"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogService, Blog } from "@/services/blog.service";
import { BlogCard } from "@/components/blog";
import { useAuthStore } from "@/store/auth.store";

export default function BookmarksPage() {
    const { isAuthenticated } = useAuthStore();
    const [bookmarks, setBookmarks] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const data = await blogService.getBookmarks();
                setBookmarks(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load bookmarks");
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, [isAuthenticated]);

    const handleRemoveBookmark = async (blogId: string) => {
        try {
            await blogService.removeBookmark(blogId);
            setBookmarks(bookmarks.filter(b => b.id !== blogId));
        } catch (err) {
            console.error("Failed to remove bookmark:", err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Login Required</h1>
                    <p className="text-[var(--muted)] mb-4">Please login to view your bookmarks</p>
                    <Link
                        href="/login"
                        className="text-[var(--accent)] hover:underline"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-8 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="h-8 w-48 bg-[var(--card-bg)] rounded animate-pulse mb-8" />
                    <div className="space-y-6">
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
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Bookmarks</h1>
                    <p className="text-[var(--muted)] mt-1">
                        Articles you've saved for later
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                        {error}
                    </div>
                )}

                {bookmarks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-full bg-[var(--card-bg)] flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📚</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
                        <p className="text-[var(--muted)] mb-6">
                            Start saving articles to read later by clicking the bookmark icon
                        </p>
                        <Link
                            href="/explore"
                            className="inline-block px-6 py-3 bg-[var(--accent)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
                        >
                            Explore Articles
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {bookmarks.map((blog, index) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                            >
                                <BlogCard
                                    slug={blog.slug}
                                    title={blog.title}
                                    excerpt={blog.excerpt}
                                    author={{ name: blog.author.name || blog.author.username || 'Anonymous', avatar: blog.author.avatar }}
                                    tag={blog.tags?.[0]?.name}
                                    readTime={blog.readTime ? String(blog.readTime) : undefined}
                                    coverImage={blog.coverImage}
                                />
                                {/* Remove bookmark button */}
                                <button
                                    onClick={() => handleRemoveBookmark(blog.id)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-[var(--background)]/80 backdrop-blur-sm border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:border-red-500/30"
                                    title="Remove bookmark"
                                >
                                    <span className="text-lg">🔖</span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
