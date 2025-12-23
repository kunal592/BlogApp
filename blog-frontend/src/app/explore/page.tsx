"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BlogCard } from "@/components/blog";
import { exploreService, PaginatedFeed, Tag, Creator } from "@/services/explore.service";
import { Blog } from "@/services/blog.service";
import { Input } from "@/components/ui";

type Tab = "trending" | "recent" | "for-you";

export default function ExplorePage() {
    const [activeTab, setActiveTab] = useState<Tab>("trending");
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Blog[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [blogsRes, tagsRes, creatorsRes] = await Promise.all([
                    activeTab === "trending" ? exploreService.getTrending() :
                        activeTab === "recent" ? exploreService.getRecent() :
                            exploreService.getForYou(),
                    exploreService.getPopularTags({ limit: 10 }),
                    exploreService.getTopCreators({ limit: 5 }),
                ]);
                setBlogs(blogsRes.data);
                setTags(tagsRes.data);
                setCreators(creatorsRes.data);
            } catch (err) {
                console.error("Failed to load explore data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [activeTab]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await exploreService.search({ q: searchQuery });
            setSearchResults(results.blogs);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const tabs: { id: Tab; label: string }[] = [
        { id: "trending", label: "Trending" },
        { id: "recent", label: "Recent" },
        { id: "for-you", label: "For You" },
    ];

    const displayBlogs = searchQuery && searchResults.length > 0 ? searchResults : blogs;

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="pt-16 pb-8 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold tracking-tight">Explore</h1>
                    <p className="mt-4 text-xl text-[var(--muted)]">
                        Curated ideas from the best minds
                    </p>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mt-8 max-w-md mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles..."
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full focus:border-[var(--accent)] focus:outline-none pr-12"
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white"
                            >
                                🔍
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Feed */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-white/10 text-white'
                                        : 'text-[var(--muted)] hover:text-white'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Blog List */}
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="glass-subtle rounded-xl p-6 animate-pulse">
                                    <div className="h-6 w-3/4 bg-white/10 rounded mb-3" />
                                    <div className="h-4 w-full bg-white/10 rounded mb-2" />
                                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : displayBlogs.length === 0 ? (
                        <div className="text-center py-16 glass-subtle rounded-xl">
                            <p className="text-[var(--muted)]">No articles found</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {displayBlogs.map((blog, index) => (
                                <motion.div
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <BlogCard
                                        slug={blog.slug}
                                        title={blog.title}
                                        excerpt={blog.excerpt}
                                        author={{
                                            name: blog.author.name || 'Anonymous',
                                            avatar: blog.author.avatar,
                                        }}
                                        tag={blog.tags?.[0]?.name}
                                        readTime={blog.readTime ? `${blog.readTime} min` : undefined}
                                        coverImage={blog.coverImage}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-8">
                    {/* Popular Tags */}
                    <div className="glass-subtle rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Popular Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    href={`/explore/tag/${tag.slug}`}
                                    className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    #{tag.name}
                                </Link>
                            ))}
                            {tags.length === 0 && (
                                <p className="text-sm text-[var(--muted)]">No tags yet</p>
                            )}
                        </div>
                    </div>

                    {/* Top Creators */}
                    <div className="glass-subtle rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Top Creators</h3>
                        <div className="space-y-4">
                            {creators.map((creator) => (
                                <Link
                                    key={creator.id}
                                    href={`/profile/${creator.username}`}
                                    className="flex items-center gap-3 group"
                                >
                                    {creator.avatar ? (
                                        <img
                                            src={creator.avatar}
                                            alt={creator.name || 'Creator'}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-black font-bold">
                                            {(creator.name || 'C').charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate group-hover:text-[var(--accent)] transition-colors">
                                            {creator.name || creator.username}
                                        </p>
                                        <p className="text-sm text-[var(--muted)]">
                                            {creator.followerCount} followers
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {creators.length === 0 && (
                                <p className="text-sm text-[var(--muted)]">No creators yet</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
