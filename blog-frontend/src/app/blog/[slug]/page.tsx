"use client";

import { useState } from "react";
import { motion, useScroll } from "framer-motion";
import { dummyBlogs } from "@/lib/dummy-data";
import { LikeButton, BookmarkButton, FollowButton } from "@/components/ui";
import { AskAISidebar } from "@/components/ai";
import { CommunityNotes, AddNoteForm } from "@/components/community";

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

// Dummy community notes
const dummyCommunityNotes = [
    {
        id: "1",
        content: "This article oversimplifies the current state of AI writing tools. While they are improving, they still struggle significantly with technical accuracy in specialized fields.",
        quote: "AI handles the scaffolding so writers can focus on what matters",
        author: { name: "Dr. Michael Chen", trustScore: 85 },
        helpfulVotes: 42,
        notHelpfulVotes: 8,
        userVote: null,
        createdAt: "2024-12-22",
        authorResponse: "Valid point! I've updated the article to clarify that specialized domains still require human expertise for fact-checking.",
    },
    {
        id: "2",
        content: "Worth noting that many AI writing tools are trained on data with potential copyright issues. Writers should be aware of the legal landscape.",
        author: { name: "Legal_Eagle", trustScore: 62 },
        helpfulVotes: 28,
        notHelpfulVotes: 3,
        userVote: null,
        createdAt: "2024-12-21",
    },
];

export default function BlogPage() {
    const blog = dummyBlogs[0];
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [showAddNote, setShowAddNote] = useState(false);

    const handleAddNote = async (content: string, quote?: string) => {
        console.log("Adding note:", { content, quote });
        // TODO: Implement actual API call
    };

    return (
        <>
            <ReadingProgress />
            <AskAISidebar
                blogId={blog.slug}
                blogTitle={blog.title}
                isOpen={isAIOpen}
                onClose={() => setIsAIOpen(false)}
            />
            <AddNoteForm
                isOpen={showAddNote}
                onClose={() => setShowAddNote(false)}
                onSubmit={handleAddNote}
            />

            <article className="min-h-screen">
                {/* Hero */}
                <header className="pt-20 pb-16 px-6">
                    <div className="max-w-3xl mx-auto">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm text-[var(--accent)] font-medium"
                        >
                            {blog.tag}
                        </motion.span>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 text-4xl md:text-5xl font-bold leading-tight tracking-tight"
                        >
                            {blog.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-purple-500/20 flex items-center justify-center text-lg font-medium">
                                    {blog.author.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">{blog.author.name}</p>
                                    <p className="text-sm text-[var(--muted)]">
                                        {blog.readTime} · Dec 23, 2024
                                    </p>
                                </div>
                            </div>
                            <FollowButton initialFollowing={false} />
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
                        <div className="space-y-6">
                            <p className="text-xl text-[var(--muted)] leading-relaxed">
                                {blog.excerpt}
                            </p>

                            <h2 className="text-2xl font-semibold mt-12 mb-4">The Current State of AI Writing</h2>
                            <p className="text-lg text-[var(--foreground)]/80 leading-relaxed">
                                Modern language models have evolved far beyond simple text completion. They understand context, maintain voice consistency, and can even adapt to specific brand guidelines.
                            </p>

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

                {/* Community Notes Section */}
                <section className="px-6 py-12 border-t border-white/10">
                    <div className="max-w-3xl mx-auto">
                        <CommunityNotes
                            notes={dummyCommunityNotes as any}
                            onVote={async (id, vote) => console.log("Vote:", id, vote)}
                            onAddNote={() => setShowAddNote(true)}
                        />
                    </div>
                </section>

                {/* Floating Actions */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="glass px-6 py-3 rounded-full flex items-center gap-6"
                    >
                        <LikeButton initialCount={128} />
                        <button className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors">
                            <span>💬</span>
                            <span className="text-sm">24</span>
                        </button>
                        <BookmarkButton />
                        <button
                            onClick={() => setIsAIOpen(true)}
                            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                        >
                            <span>✦</span>
                            <span className="text-sm">Ask AI</span>
                        </button>
                    </motion.div>
                </div>

                <div className="h-24" />
            </article>
        </>
    );
}
