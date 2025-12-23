"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TipTapEditor, MediaUpload } from "@/components/editor";
import { Button } from "@/components/ui";
import { blogService } from "@/services/blog.service";
import { mediaService } from "@/services/media.service";

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export default function WritePage() {
    const router = useRouter();
    const [blogId, setBlogId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
    const [showCoverUpload, setShowCoverUpload] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Autosave effect - saves to API after 3 seconds of inactivity
    useEffect(() => {
        if (!title && !content) return;

        setSaveStatus("unsaved");
        const timer = setTimeout(async () => {
            setSaveStatus("saving");
            try {
                if (blogId) {
                    // Update existing blog
                    await blogService.update(blogId, { title, content, coverImage: coverImage || undefined });
                } else {
                    // Create new blog
                    const blog = await blogService.create({ title, content, coverImage: coverImage || undefined });
                    setBlogId(blog.id);
                }
                setSaveStatus("saved");
                setError(null);
            } catch (err) {
                setSaveStatus("error");
                setError(err instanceof Error ? err.message : "Failed to save");
                // Fallback to localStorage
                localStorage.setItem("draft", JSON.stringify({ title, content, coverImage }));
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [title, content, coverImage, blogId]);

    // Load draft on mount
    useEffect(() => {
        const saved = localStorage.getItem("draft");
        if (saved) {
            try {
                const { title: t, content: c, coverImage: ci } = JSON.parse(saved);
                setTitle(t || "");
                setContent(c || "");
                setCoverImage(ci || null);
            } catch { }
        }
    }, []);

    const handleCoverUpload = async (file: File): Promise<string> => {
        try {
            // Upload to R2 via backend
            const url = await mediaService.uploadImage(file);
            setCoverImage(url);
            setShowCoverUpload(false);
            return url;
        } catch (err) {
            // Fallback to local URL for preview
            const url = URL.createObjectURL(file);
            setCoverImage(url);
            setShowCoverUpload(false);
            return url;
        }
    };

    const handlePreview = () => {
        // Open preview in new tab with draft data
        if (blogId) {
            window.open(`/blog/preview/${blogId}`, '_blank');
        } else {
            // Store in sessionStorage for preview
            sessionStorage.setItem('preview', JSON.stringify({ title, content, coverImage }));
            window.open('/blog/preview', '_blank');
        }
    };

    const handlePublish = async () => {
        if (!title.trim()) {
            setError("Please add a title");
            return;
        }
        if (!content.trim()) {
            setError("Please add some content");
            return;
        }

        setIsPublishing(true);
        setError(null);

        try {
            let id = blogId;

            // If no blog ID yet, create one first
            if (!id) {
                const blog = await blogService.create({ title, content, coverImage: coverImage || undefined });
                id = blog.id;
                setBlogId(id);
            } else {
                // Save latest changes
                await blogService.update(id, { title, content, coverImage: coverImage || undefined });
            }

            // Publish the blog
            const publishedBlog = await blogService.publish(id);

            // Clear the local draft
            localStorage.removeItem("draft");

            // Redirect to the published blog
            router.push(`/blog/${publishedBlog.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish");
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <header className="fixed top-16 left-0 right-0 z-30 glass-subtle">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className={`text-sm ${saveStatus === "error" ? "text-red-400" : "text-[var(--muted)]"}`}>
                            {saveStatus === "saved" && "✓ Saved"}
                            {saveStatus === "saving" && "Saving..."}
                            {saveStatus === "unsaved" && "Unsaved changes"}
                            {saveStatus === "error" && "⚠ Save failed"}
                        </span>
                        {error && (
                            <span className="text-sm text-red-400">{error}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={handlePreview}>
                            Preview
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handlePublish}
                            disabled={isPublishing || !title.trim()}
                            isLoading={isPublishing}
                        >
                            Publish
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Editor */}
            <main className="pt-36 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Cover Image */}
                    <AnimatePresence>
                        {coverImage ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative mb-8 rounded-2xl overflow-hidden group"
                            >
                                <img
                                    src={coverImage}
                                    alt="Cover"
                                    className="w-full aspect-[2/1] object-cover"
                                />
                                <button
                                    onClick={() => setCoverImage(null)}
                                    className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/50 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Remove
                                </button>
                            </motion.div>
                        ) : showCoverUpload ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-8"
                            >
                                <MediaUpload onUpload={handleCoverUpload} />
                                <button
                                    onClick={() => setShowCoverUpload(false)}
                                    className="mt-3 text-sm text-[var(--muted)] hover:text-white"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setShowCoverUpload(true)}
                                className="mb-8 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                            >
                                <span>+</span> Add cover image
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder:text-white/20 mb-8"
                    />

                    {/* Editor */}
                    <TipTapEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Tell your story..."
                    />
                </div>
            </main>

            {/* Side Tools */}
            <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
                <div className="glass-subtle rounded-xl p-2 flex flex-col gap-2">
                    <SideButton title="Add image" onClick={() => { }}>📷</SideButton>
                    <SideButton title="Add embed" onClick={() => { }}>🔗</SideButton>
                    <SideButton title="Add divider" onClick={() => { }}>—</SideButton>
                </div>
            </aside>
        </div>
    );
}

function SideButton({
    children,
    title,
    onClick
}: {
    children: React.ReactNode;
    title: string;
    onClick: () => void;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            title={title}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-white/5 transition-colors"
        >
            {children}
        </motion.button>
    );
}
