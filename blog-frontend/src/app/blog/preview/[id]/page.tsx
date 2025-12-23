"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { blogService, Blog } from "@/services/blog.service";

export default function PreviewPage() {
    const params = useParams();
    const blogId = params.id as string;
    const [blog, setBlog] = useState<Blog | null>(null);
    const [previewData, setPreviewData] = useState<{ title: string; content: string; coverImage?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPreview = async () => {
            // First check sessionStorage for unsaved preview
            const sessionPreview = sessionStorage.getItem('preview');
            if (!blogId && sessionPreview) {
                try {
                    const data = JSON.parse(sessionPreview);
                    setPreviewData(data);
                    setLoading(false);
                    return;
                } catch {
                    // Continue to load from API
                }
            }

            // Load from API if we have a blog ID
            if (blogId) {
                try {
                    const data = await blogService.getBySlug(blogId);
                    setBlog(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to load preview");
                }
            }
            setLoading(false);
        };

        loadPreview();
    }, [blogId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.close()}
                        className="text-[var(--accent)] hover:underline"
                    >
                        Close preview
                    </button>
                </div>
            </div>
        );
    }

    const title = blog?.title || previewData?.title || "Untitled";
    const content = blog?.content || previewData?.content || "";
    const coverImage = blog?.coverImage || previewData?.coverImage;

    return (
        <div className="min-h-screen">
            {/* Preview Banner */}
            <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <span className="text-yellow-400 text-sm font-medium">
                        📝 Preview Mode - This is how your post will look when published
                    </span>
                    <button
                        onClick={() => window.close()}
                        className="text-sm text-[var(--muted)] hover:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Article */}
            <article className="pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Cover Image */}
                    {coverImage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 rounded-2xl overflow-hidden"
                        >
                            <img
                                src={coverImage}
                                alt={title}
                                className="w-full aspect-[2/1] object-cover"
                            />
                        </motion.div>
                    )}

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-8"
                    >
                        {title}
                    </motion.h1>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-invert prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </article>
        </div>
    );
}
