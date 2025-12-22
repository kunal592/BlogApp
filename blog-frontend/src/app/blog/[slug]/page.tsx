"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { dummyBlogContent, dummyBlogs } from "@/lib/dummy-data";

// Reading Progress Bar Component
function ReadingProgress() {
    const { scrollYProgress } = useScroll();

    return (
        <motion.div
            className="fixed top-16 left-0 right-0 h-[2px] bg-[var(--accent)] origin-left z-40"
            style={{ scaleX: scrollYProgress }}
        />
    );
}

export default function BlogPage() {
    const articleRef = useRef<HTMLElement>(null);
    const blog = dummyBlogs[0]; // Using first dummy blog

    return (
        <>
            <ReadingProgress />

            <article ref={articleRef} className="min-h-screen">
                {/* Hero */}
                <header className="pt-20 pb-16 px-6">
                    <div className="max-w-3xl mx-auto">
                        {/* Tag */}
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm text-[var(--accent)] font-medium"
                        >
                            {blog.tag}
                        </motion.span>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 text-4xl md:text-5xl font-bold leading-tight tracking-tight"
                        >
                            {blog.title}
                        </motion.h1>

                        {/* Meta */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 flex items-center gap-4"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-purple-500/20 flex items-center justify-center text-lg font-medium">
                                {blog.author.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium">{blog.author.name}</p>
                                <p className="text-sm text-[var(--muted)]">
                                    {blog.readTime} · Dec 23, 2024
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* Cover Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="px-6"
                >
                    <div className="max-w-4xl mx-auto aspect-[2/1] rounded-2xl overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-[var(--accent)]/20 via-purple-500/10 to-pink-500/10" />
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="px-6 py-16"
                >
                    <div className="max-w-3xl mx-auto prose-custom">
                        {/* Rendered Markdown-style content */}
                        <div className="space-y-6">
                            <p className="text-xl text-[var(--muted)] leading-relaxed">
                                {blog.excerpt}
                            </p>

                            <h2 className="text-2xl font-semibold mt-12 mb-4">The Current State of AI Writing</h2>
                            <p className="text-lg text-[var(--foreground)]/80 leading-relaxed">
                                Modern language models have evolved far beyond simple text completion. They understand context, maintain voice consistency, and can even adapt to specific brand guidelines.
                            </p>

                            {/* Quote Block */}
                            <blockquote className="my-10 pl-6 border-l-2 border-[var(--accent)]">
                                <p className="text-xl italic text-[var(--foreground)]">
                                    "The goal isn't to replace human creativity, but to amplify it. AI handles the scaffolding so writers can focus on what matters: original thought."
                                </p>
                                <cite className="block mt-3 text-sm text-[var(--muted)] not-italic">
                                    — Sarah Chen
                                </cite>
                            </blockquote>

                            <h3 className="text-xl font-semibold mt-10 mb-4">Key Developments in 2024</h3>
                            <p className="text-lg text-[var(--foreground)]/80 leading-relaxed">
                                The past year has seen remarkable advances in specialized writing tools:
                            </p>

                            <ul className="space-y-3 text-lg text-[var(--foreground)]/80 ml-6">
                                <li className="flex gap-3">
                                    <span className="text-[var(--accent)]">→</span>
                                    <span><strong>Context-aware editing</strong> that understands your entire document</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-[var(--accent)]">→</span>
                                    <span><strong>Style matching</strong> that learns from your previous work</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-[var(--accent)]">→</span>
                                    <span><strong>Research integration</strong> that fact-checks in real-time</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-[var(--accent)]">→</span>
                                    <span><strong>SEO optimization</strong> that doesn't compromise quality</span>
                                </li>
                            </ul>

                            <h2 className="text-2xl font-semibold mt-12 mb-4">The Human Element</h2>
                            <p className="text-lg text-[var(--foreground)]/80 leading-relaxed">
                                Despite these advances, the most compelling content still emerges from human insight. AI excels at structure and efficiency, but struggles with original perspectives, emotional resonance, cultural nuance, and ethical judgment.
                            </p>

                            <p className="text-lg text-[var(--foreground)]/80 leading-relaxed">
                                The writers who thrive in this new era are those who view AI as a tool, not a replacement. They leverage automation for research and first drafts while reserving their energy for the creative decisions that truly matter.
                            </p>

                            <div className="my-12 p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                <h4 className="font-semibold mb-3">Key Takeaway</h4>
                                <p className="text-[var(--muted)]">
                                    The question isn't whether AI will transform content creation—it already has. The question is how we adapt our creative processes to harness this transformation while preserving what makes human writing irreplaceable.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="glass px-6 py-3 rounded-full flex items-center gap-6"
                    >
                        <button className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors">
                            <span>♡</span>
                            <span className="text-sm">128</span>
                        </button>
                        <button className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors">
                            <span>💬</span>
                            <span className="text-sm">24</span>
                        </button>
                        <button className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors">
                            <span>⚐</span>
                            <span className="text-sm">Save</span>
                        </button>
                        <button className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors">
                            <span>↗</span>
                            <span className="text-sm">Share</span>
                        </button>
                    </motion.div>
                </div>

                {/* Spacer for floating actions */}
                <div className="h-24" />
            </article>
        </>
    );
}
