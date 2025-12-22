"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TipTapEditor, MediaUpload } from "@/components/editor";
import { Input, Button } from "@/components/ui";

type SaveStatus = "saved" | "saving" | "unsaved";

export default function WritePage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
    const [showCoverUpload, setShowCoverUpload] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);

    // Autosave effect
    useEffect(() => {
        if (!title && !content) return;

        setSaveStatus("unsaved");
        const timer = setTimeout(() => {
            // Simulate autosave
            setSaveStatus("saving");
            setTimeout(() => {
                // Save to localStorage for now
                localStorage.setItem("draft", JSON.stringify({ title, content, coverImage }));
                setSaveStatus("saved");
            }, 500);
        }, 2000);

        return () => clearTimeout(timer);
    }, [title, content, coverImage]);

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
        // For now, create a local URL (replace with actual R2 upload later)
        const url = URL.createObjectURL(file);
        setCoverImage(url);
        setShowCoverUpload(false);
        return url;
    };

    const handlePublish = () => {
        // TODO: Implement actual publish
        console.log("Publishing:", { title, content, coverImage });
    };

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <header className="fixed top-16 left-0 right-0 z-30 glass-subtle">
                <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--muted)]">
                            {saveStatus === "saved" && "✓ Saved"}
                            {saveStatus === "saving" && "Saving..."}
                            {saveStatus === "unsaved" && "Unsaved changes"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm">
                            Preview
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handlePublish}
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
