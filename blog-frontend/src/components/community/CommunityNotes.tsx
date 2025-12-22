"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CommunityNote {
    id: string;
    content: string;
    quote?: string;
    author: {
        name: string;
        trustScore: number; // 0-100
    };
    helpfulVotes: number;
    notHelpfulVotes: number;
    userVote?: "helpful" | "not_helpful" | null;
    createdAt: string;
    authorResponse?: string;
}

interface CommunityNotesProps {
    notes: CommunityNote[];
    onVote?: (noteId: string, vote: "helpful" | "not_helpful") => Promise<void>;
    onAddNote?: () => void;
}

export function CommunityNotes({ notes, onVote, onAddNote }: CommunityNotesProps) {
    if (notes.length === 0) {
        return (
            <div className="py-8 text-center">
                <span className="text-3xl mb-3 block">📝</span>
                <p className="text-[var(--muted)]">No community notes yet</p>
                <button
                    onClick={onAddNote}
                    className="mt-4 text-sm text-[var(--accent)] hover:underline"
                >
                    Add the first note
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-[var(--accent)]">🧠</span> Crowd Wisdom
                </h3>
                <button
                    onClick={onAddNote}
                    className="text-sm text-[var(--accent)] hover:underline"
                >
                    + Add Note
                </button>
            </div>

            <div className="space-y-4">
                {notes.map((note) => (
                    <NoteCard key={note.id} note={note} onVote={onVote} />
                ))}
            </div>
        </div>
    );
}

function NoteCard({
    note,
    onVote
}: {
    note: CommunityNote;
    onVote?: (noteId: string, vote: "helpful" | "not_helpful") => Promise<void>;
}) {
    const [userVote, setUserVote] = useState(note.userVote);
    const [helpfulCount, setHelpfulCount] = useState(note.helpfulVotes);
    const [notHelpfulCount, setNotHelpfulCount] = useState(note.notHelpfulVotes);
    const [showResponse, setShowResponse] = useState(false);

    const handleVote = async (vote: "helpful" | "not_helpful") => {
        const prevVote = userVote;

        // Optimistic update
        if (userVote === vote) {
            // Undo vote
            setUserVote(null);
            if (vote === "helpful") setHelpfulCount((c) => c - 1);
            else setNotHelpfulCount((c) => c - 1);
        } else {
            // New vote
            setUserVote(vote);
            if (vote === "helpful") {
                setHelpfulCount((c) => c + 1);
                if (prevVote === "not_helpful") setNotHelpfulCount((c) => c - 1);
            } else {
                setNotHelpfulCount((c) => c + 1);
                if (prevVote === "helpful") setHelpfulCount((c) => c - 1);
            }
        }

        try {
            await onVote?.(note.id, vote);
        } catch {
            // Rollback on error
            setUserVote(prevVote);
            setHelpfulCount(note.helpfulVotes);
            setNotHelpfulCount(note.notHelpfulVotes);
        }
    };

    const trustLevel = getTrustLevel(note.author.trustScore);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
            {/* Quote */}
            {note.quote && (
                <div className="mb-4 pl-4 border-l-2 border-[var(--accent)]/50">
                    <p className="text-sm text-[var(--muted)] italic">"{note.quote}"</p>
                </div>
            )}

            {/* Content */}
            <p className="text-[var(--foreground)]/90 leading-relaxed">{note.content}</p>

            {/* Author Response */}
            <AnimatePresence>
                {note.authorResponse && showResponse && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20"
                    >
                        <p className="text-xs text-[var(--accent)] mb-2 font-medium">
                            Author Response
                        </p>
                        <p className="text-sm text-[var(--foreground)]/80">
                            {note.authorResponse}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                            {note.author.name.charAt(0)}
                        </div>
                        <span className="text-sm text-[var(--muted)]">{note.author.name}</span>
                        <TrustBadge level={trustLevel} />
                    </div>
                </div>

                {/* Votes */}
                <div className="flex items-center gap-2">
                    {note.authorResponse && (
                        <button
                            onClick={() => setShowResponse(!showResponse)}
                            className="px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded transition-colors mr-2"
                        >
                            {showResponse ? "Hide" : "View"} Response
                        </button>
                    )}

                    <VoteButton
                        type="helpful"
                        count={helpfulCount}
                        active={userVote === "helpful"}
                        onClick={() => handleVote("helpful")}
                    />
                    <VoteButton
                        type="not_helpful"
                        count={notHelpfulCount}
                        active={userVote === "not_helpful"}
                        onClick={() => handleVote("not_helpful")}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function VoteButton({
    type,
    count,
    active,
    onClick,
}: {
    type: "helpful" | "not_helpful";
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${active
                    ? type === "helpful"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                }`}
        >
            <span>{type === "helpful" ? "👍" : "👎"}</span>
            <span>{count}</span>
        </motion.button>
    );
}

function TrustBadge({ level }: { level: "low" | "medium" | "high" }) {
    const config = {
        low: { color: "text-white/30", label: "New" },
        medium: { color: "text-yellow-400", label: "Trusted" },
        high: { color: "text-green-400", label: "Expert" },
    };

    return (
        <span className={`text-xs ${config[level].color}`}>
            {config[level].label}
        </span>
    );
}

function getTrustLevel(score: number): "low" | "medium" | "high" {
    if (score >= 80) return "high";
    if (score >= 40) return "medium";
    return "low";
}

// Add Note Modal Component
interface AddNoteFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string, quote?: string) => Promise<void>;
}

export function AddNoteForm({ isOpen, onClose, onSubmit }: AddNoteFormProps) {
    const [content, setContent] = useState("");
    const [quote, setQuote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, quote || undefined);
            setContent("");
            setQuote("");
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="glass p-6 rounded-2xl m-4"
                        >
                            <h3 className="text-xl font-semibold mb-4">Add Community Note</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-[var(--muted)] block mb-2">
                                        Quote (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        placeholder="Select text from the article..."
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--accent)]"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-[var(--muted)] block mb-2">
                                        Your note
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Add context, corrections, or helpful information..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--accent)] resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-[var(--muted)] hover:text-white hover:border-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!content.trim() || isSubmitting}
                                    className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-black font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Note"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
