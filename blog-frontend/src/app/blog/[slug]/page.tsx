"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import { blogService, Blog } from "@/services/blog.service";
import { commentService, Comment as CommentType } from "@/services/comment.service";
import { userService } from "@/services/user.service";
import { LikeButton, BookmarkButton, FollowButton, Button, Input } from "@/components/ui";
import { AskAISidebar } from "@/components/ai";
import { useAuthStore } from "@/store/auth.store";

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

// Comment Component
function Comment({ comment, onReply, onLike, onUnlike, currentUserId }: {
    comment: CommentType;
    onReply: (parentId: string) => void;
    onLike: (id: string) => void;
    onUnlike: (id: string) => void;
    currentUserId?: string;
}) {
    return (
        <div className="py-4">
            <div className="flex items-start gap-3">
                {comment.author.avatar ? (
                    <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                        {(comment.author.name || 'A').charAt(0)}
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/profile/${comment.author.username}`} className="font-medium hover:text-[var(--accent)]">
                            {comment.author.name || comment.author.username || 'Anonymous'}
                        </Link>
                        <span className="text-xs text-[var(--muted)]">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-[var(--foreground)]/80">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => comment.isLiked ? onUnlike(comment.id) : onLike(comment.id)}
                            className={`text-sm flex items-center gap-1 ${comment.isLiked ? 'text-red-400' : 'text-[var(--muted)] hover:text-white'}`}
                        >
                            {comment.isLiked ? '❤️' : '🤍'} {comment.likeCount}
                        </button>
                        <button onClick={() => onReply(comment.id)} className="text-sm text-[var(--muted)] hover:text-white">
                            Reply
                        </button>
                    </div>
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-4 mt-4 border-l border-white/10 pl-4 space-y-4">
                            {comment.replies.map(reply => (
                                <Comment
                                    key={reply.id}
                                    comment={reply}
                                    onReply={onReply}
                                    onLike={onLike}
                                    onUnlike={onUnlike}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BlogPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { user } = useAuthStore();

    const [blog, setBlog] = useState<Blog | null>(null);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const loadBlog = async () => {
            try {
                const data = await blogService.getBySlug(slug);
                setBlog(data);
                setIsLiked(data.isLiked || false);
                setIsBookmarked(data.isBookmarked || false);
                setLikeCount(data.likeCount);

                // Record view
                blogService.recordView(data.id).catch(() => { });

                // Load comments
                const commentsData = await commentService.getBlogComments(data.id);
                setComments(commentsData.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Blog not found");
            } finally {
                setLoading(false);
            }
        };
        loadBlog();
    }, [slug]);

    const handleLike = async () => {
        if (!blog || !user) return;
        try {
            if (isLiked) {
                await blogService.unlike(blog.id);
                setIsLiked(false);
                setLikeCount(c => c - 1);
            } else {
                await blogService.like(blog.id);
                setIsLiked(true);
                setLikeCount(c => c + 1);
            }
        } catch (err) {
            console.error("Like error:", err);
        }
    };

    const handleBookmark = async () => {
        if (!blog || !user) return;
        try {
            if (isBookmarked) {
                await blogService.removeBookmark(blog.id);
                setIsBookmarked(false);
            } else {
                await blogService.bookmark(blog.id);
                setIsBookmarked(true);
            }
        } catch (err) {
            console.error("Bookmark error:", err);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!blog || !user || !newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const comment = await commentService.create({
                blogId: blog.id,
                content: newComment,
                parentId: replyingTo || undefined,
            });
            if (replyingTo) {
                // Add reply to parent comment
                setComments(comments.map(c => {
                    if (c.id === replyingTo) {
                        return { ...c, replies: [...(c.replies || []), comment] };
                    }
                    return c;
                }));
            } else {
                setComments([comment, ...comments]);
            }
            setNewComment("");
            setReplyingTo(null);
        } catch (err) {
            console.error("Comment error:", err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleCommentLike = async (id: string) => {
        try {
            await commentService.like(id);
            setComments(comments.map(c => c.id === id ? { ...c, isLiked: true, likeCount: c.likeCount + 1 } : c));
        } catch (err) {
            console.error("Like comment error:", err);
        }
    };

    const handleCommentUnlike = async (id: string) => {
        try {
            await commentService.unlike(id);
            setComments(comments.map(c => c.id === id ? { ...c, isLiked: false, likeCount: c.likeCount - 1 } : c));
        } catch (err) {
            console.error("Unlike comment error:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-6">
                <div className="max-w-3xl mx-auto animate-pulse">
                    <div className="h-8 w-24 bg-white/10 rounded mb-4" />
                    <div className="h-12 w-3/4 bg-white/10 rounded mb-8" />
                    <div className="h-64 bg-white/10 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Blog not found</h1>
                    <p className="text-[var(--muted)]">{error}</p>
                    <Link href="/explore" className="text-[var(--accent)] hover:underline mt-4 inline-block">
                        Explore blogs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <ReadingProgress />
            <AskAISidebar
                blogId={blog.id}
                blogTitle={blog.title}
                isOpen={isAIOpen}
                onClose={() => setIsAIOpen(false)}
            />

            <article className="min-h-screen">
                {/* Hero */}
                <header className="pt-20 pb-16 px-6">
                    <div className="max-w-3xl mx-auto">
                        {blog.tags?.[0] && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-[var(--accent)] font-medium"
                            >
                                {blog.tags[0].name}
                            </motion.span>
                        )}

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-4 text-4xl md:text-5xl font-bold leading-tight tracking-tight"
                        >
                            {blog.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-8 flex items-center justify-between"
                        >
                            <Link href={`/profile/${blog.author.username}`} className="flex items-center gap-4 group">
                                {blog.author.avatar ? (
                                    <img src={blog.author.avatar} alt="" className="w-12 h-12 rounded-full" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-purple-500/20 flex items-center justify-center text-lg font-medium">
                                        {(blog.author.name || 'A').charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium group-hover:text-[var(--accent)] transition-colors">
                                        {blog.author.name || blog.author.username}
                                    </p>
                                    <p className="text-sm text-[var(--muted)]">
                                        {blog.readTime ? `${blog.readTime} min read` : ''} · {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </header>

                {/* Cover Image */}
                {blog.coverImage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="px-6"
                    >
                        <div className="max-w-4xl mx-auto aspect-[2/1] rounded-2xl overflow-hidden">
                            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                    </motion.div>
                )}

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="px-6 py-16"
                >
                    <div className="max-w-3xl mx-auto prose prose-invert prose-lg"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </motion.div>

                {/* Comments Section */}
                <section className="px-6 py-12 border-t border-white/10">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-xl font-semibold mb-6">
                            Comments ({comments.length})
                        </h2>

                        {/* Add Comment Form */}
                        {user ? (
                            <form onSubmit={handleSubmitComment} className="mb-8">
                                {replyingTo && (
                                    <div className="mb-2 text-sm text-[var(--muted)] flex items-center gap-2">
                                        <span>Replying to comment</span>
                                        <button type="button" onClick={() => setReplyingTo(null)} className="text-red-400">Cancel</button>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--accent)] focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button type="submit" variant="primary" size="sm" disabled={submittingComment || !newComment.trim()}>
                                        {submittingComment ? 'Posting...' : 'Post Comment'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="mb-8 p-4 rounded-xl bg-white/5 text-center">
                                <p className="text-[var(--muted)]">
                                    <Link href="/login" className="text-[var(--accent)] hover:underline">Login</Link> to leave a comment
                                </p>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="divide-y divide-white/10">
                            {comments.map(comment => (
                                <Comment
                                    key={comment.id}
                                    comment={comment}
                                    onReply={setReplyingTo}
                                    onLike={handleCommentLike}
                                    onUnlike={handleCommentUnlike}
                                    currentUserId={user?.id}
                                />
                            ))}
                            {comments.length === 0 && (
                                <p className="py-8 text-center text-[var(--muted)]">No comments yet. Be the first!</p>
                            )}
                        </div>
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
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-400' : 'text-[var(--muted)] hover:text-white'}`}
                        >
                            <span>{isLiked ? '❤️' : '🤍'}</span>
                            <span className="text-sm">{likeCount}</span>
                        </button>
                        <button className="flex items-center gap-2 text-[var(--muted)] hover:text-white transition-colors">
                            <span>💬</span>
                            <span className="text-sm">{comments.length}</span>
                        </button>
                        <button
                            onClick={handleBookmark}
                            className={`transition-colors ${isBookmarked ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-white'}`}
                        >
                            {isBookmarked ? '🔖' : '📑'}
                        </button>
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
