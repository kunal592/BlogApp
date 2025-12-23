"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface BlogCardProps {
    slug: string;
    title: string;
    excerpt?: string;
    author: {
        name: string;
        avatar?: string;
    };
    tag?: string;
    readTime?: string;
    coverImage?: string;
    rank?: number;
}

export function BlogCard({
    slug,
    title,
    excerpt,
    author,
    tag,
    readTime,
    coverImage,
    rank,
}: BlogCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href={`/blog/${slug}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500">
                    {/* Cover Image */}
                    {coverImage && (
                        <div className="aspect-[2/1] overflow-hidden">
                            <motion.div
                                className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02]"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Placeholder gradient - replace with actual image */}
                                <div className="w-full h-full bg-gradient-to-br from-[var(--accent)]/20 to-purple-500/10" />
                            </motion.div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-8 relative">
                        {/* Rank Badge */}
                        {rank && (
                            <div className="absolute -top-6 right-8 w-12 h-12 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-bold text-lg">
                                #{rank}
                            </div>
                        )}

                        {/* Tag */}
                        {tag && (
                            <span className="text-sm text-[var(--accent)] font-medium">
                                {tag}
                            </span>
                        )}

                        {/* Title */}
                        <h2 className="mt-3 text-2xl font-semibold leading-tight group-hover:text-[var(--accent)] transition-colors duration-300">
                            {title}
                        </h2>

                        {/* Excerpt */}
                        {excerpt && (
                            <p className="mt-4 text-[var(--muted)] leading-relaxed line-clamp-2">
                                {excerpt}
                            </p>
                        )}

                        {/* Footer */}
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-medium">
                                    {author.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{author.name}</p>
                                    {readTime && <p className="text-xs text-[var(--muted)]">{readTime}</p>}
                                </div>
                            </div>

                            {/* Arrow */}
                            <motion.span
                                className="text-[var(--muted)] group-hover:text-white transition-colors"
                                initial={{ x: 0 }}
                                whileHover={{ x: 4 }}
                            >
                                →
                            </motion.span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.article>
    );
}
