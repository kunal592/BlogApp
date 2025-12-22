"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    citations?: { paragraph: number; text: string }[];
}

interface AskAISidebarProps {
    blogId: string;
    blogTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export function AskAISidebar({ blogId, blogTitle, isOpen, onClose }: AskAISidebarProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Based on the article, AI-powered content creation is transforming how writers work by handling scaffolding tasks while preserving human creativity for original thought and emotional resonance.",
                citations: [
                    { paragraph: 2, text: "The goal isn't to replace human creativity, but to amplify it." },
                    { paragraph: 4, text: "AI excels at structure and efficiency, but struggles with original perspectives." },
                ],
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0B0B0C] border-l border-white/10 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <header className="p-6 border-b border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <span className="text-[var(--accent)]">✦</span> Ask AI
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-[var(--muted)] hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-sm text-[var(--muted)] line-clamp-1">
                                About: {blogTitle}
                            </p>
                        </header>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-4xl mb-4 block">🧠</span>
                                    <p className="text-[var(--muted)]">
                                        Ask anything about this article.
                                    </p>
                                    <p className="text-sm text-white/30 mt-2">
                                        I'll answer based on the content.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <MessageBubble key={message.id} message={message} />
                                ))
                            )}

                            {isLoading && (
                                <div className="flex items-center gap-2 text-[var(--muted)]">
                                    <span className="animate-pulse">●</span>
                                    <span className="animate-pulse delay-100">●</span>
                                    <span className="animate-pulse delay-200">●</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--accent)]"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="px-4 py-3 rounded-xl bg-[var(--accent)] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    →
                                </button>
                            </div>
                        </form>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isUser ? "ml-8" : "mr-8"}`}
        >
            <div
                className={`p-4 rounded-2xl ${isUser
                        ? "bg-[var(--accent)] text-black ml-auto"
                        : "bg-white/5 border border-white/10"
                    }`}
            >
                <p className="leading-relaxed">{message.content}</p>
            </div>

            {/* Citations */}
            {message.citations && message.citations.length > 0 && (
                <div className="mt-3 space-y-2">
                    <p className="text-xs text-[var(--muted)] uppercase tracking-wide">
                        Sources from article
                    </p>
                    {message.citations.map((citation, i) => (
                        <div
                            key={i}
                            className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-sm"
                        >
                            <span className="text-[var(--accent)] text-xs mr-2">
                                ¶{citation.paragraph}
                            </span>
                            <span className="text-[var(--muted)] italic">
                                "{citation.text}"
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
