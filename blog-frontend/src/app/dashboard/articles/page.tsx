"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogService, Blog } from "@/services/blog.service";
import { Button } from "@/components/ui";

export default function MyArticlesPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBlogs = async () => {
            try {
                const data = await blogService.getMyBlogs();
                setBlogs(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load articles");
            } finally {
                setLoading(false);
            }
        };
        loadBlogs();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this article?")) return;

        try {
            await blogService.delete(id);
            setBlogs(blogs.filter(b => b.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        }
    };

    const handlePublish = async (id: string) => {
        try {
            const updated = await blogService.publish(id);
            setBlogs(blogs.map(b => b.id === id ? updated : b));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to publish");
        }
    };

    const handleUnpublish = async (id: string) => {
        try {
            const updated = await blogService.unpublish(id);
            setBlogs(blogs.map(b => b.id === id ? updated : b));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to unpublish");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-8 pb-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
                    </div>
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Articles</h1>
                        <p className="text-[var(--muted)] mt-1">
                            {blogs.length} article{blogs.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link href="/write">
                        <Button variant="primary">+ New Article</Button>
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                )}

                {/* Articles List */}
                {blogs.length === 0 ? (
                    <div className="text-center py-16 glass-subtle rounded-2xl">
                        <p className="text-[var(--muted)] mb-4">You haven't written any articles yet.</p>
                        <Link href="/write">
                            <Button variant="primary">Write your first article</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {blogs.map((blog, index) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-subtle rounded-xl p-6 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${blog.status === 'PUBLISHED'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : blog.status === 'DRAFT'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {blog.status}
                                            </span>
                                            {blog.isPremium && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                                                    Premium
                                                </span>
                                            )}
                                        </div>
                                        <Link href={blog.status === 'PUBLISHED' ? `/blog/${blog.slug}` : `/write?id=${blog.id}`}>
                                            <h3 className="text-lg font-medium hover:text-[var(--accent)] transition-colors truncate">
                                                {blog.title || "Untitled"}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-[var(--muted)]">
                                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                            <span>{blog.viewCount} views</span>
                                            <span>{blog.likeCount} likes</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {blog.status === 'DRAFT' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handlePublish(blog.id)}
                                            >
                                                Publish
                                            </Button>
                                        )}
                                        {blog.status === 'PUBLISHED' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleUnpublish(blog.id)}
                                            >
                                                Unpublish
                                            </Button>
                                        )}
                                        <Link href={`/write?id=${blog.id}`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(blog.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </Button>
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
