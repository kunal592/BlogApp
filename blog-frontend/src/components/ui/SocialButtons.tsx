"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
    initialLiked?: boolean;
    initialCount?: number;
    onLike?: (liked: boolean) => Promise<void>;
}

export function LikeButton({ initialLiked = false, initialCount = 0, onLike }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = async () => {
        // Optimistic update
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setCount((prev) => (newLiked ? prev + 1 : prev - 1));
        setIsAnimating(true);

        try {
            await onLike?.(newLiked);
        } catch {
            // Rollback on error
            setIsLiked(!newLiked);
            setCount((prev) => (newLiked ? prev - 1 : prev + 1));
        }

        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <motion.button
            onClick={handleClick}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors group"
        >
            <span className="relative">
                <motion.span
                    animate={{
                        scale: isAnimating && isLiked ? [1, 1.3, 1] : 1,
                        color: isLiked ? "#ef4444" : "currentColor",
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-lg"
                >
                    {isLiked ? "❤️" : "♡"}
                </motion.span>

                {/* Burst effect */}
                <AnimatePresence>
                    {isAnimating && isLiked && (
                        <motion.span
                            initial={{ opacity: 1, scale: 0.5 }}
                            animate={{ opacity: 0, scale: 2 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 rounded-full bg-red-500/20"
                        />
                    )}
                </AnimatePresence>
            </span>
            <span className="text-sm">{count}</span>
        </motion.button>
    );
}

interface BookmarkButtonProps {
    initialBookmarked?: boolean;
    onBookmark?: (bookmarked: boolean) => Promise<void>;
}

export function BookmarkButton({ initialBookmarked = false, onBookmark }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

    const handleClick = async () => {
        const newBookmarked = !isBookmarked;
        setIsBookmarked(newBookmarked);

        try {
            await onBookmark?.(newBookmarked);
        } catch {
            setIsBookmarked(!newBookmarked);
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors"
        >
            <motion.span
                animate={{
                    scale: isBookmarked ? [1, 1.2, 1] : 1,
                    color: isBookmarked ? "var(--accent)" : "currentColor",
                }}
                transition={{ duration: 0.2 }}
                className="text-lg"
            >
                {isBookmarked ? "◈" : "◇"}
            </motion.span>
            <span className="text-sm">{isBookmarked ? "Saved" : "Save"}</span>
        </motion.button>
    );
}

interface FollowButtonProps {
    initialFollowing?: boolean;
    onFollow?: (following: boolean) => Promise<void>;
}

export function FollowButton({ initialFollowing = false, onFollow }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        const newFollowing = !isFollowing;
        setIsLoading(true);
        setIsFollowing(newFollowing);

        try {
            await onFollow?.(newFollowing);
        } catch {
            setIsFollowing(!newFollowing);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isFollowing
                    ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400"
                    : "bg-[var(--accent)] text-black hover:opacity-90"
                }`}
        >
            <motion.span
                initial={false}
                animate={{ opacity: 1 }}
                key={isFollowing ? "following" : "follow"}
            >
                {isFollowing ? "Following" : "Follow"}
            </motion.span>
        </motion.button>
    );
}
