import { BlogCard } from "@/components/blog";
import { dummyBlogs } from "@/lib/dummy-data";

export default function ExplorePage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="pt-16 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold tracking-tight">
                        Explore
                    </h1>
                    <p className="mt-4 text-xl text-[var(--muted)]">
                        Curated ideas from the best minds
                    </p>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="px-6 border-b border-white/10">
                <div className="max-w-4xl mx-auto flex gap-8 overflow-x-auto hide-scrollbar">
                    {["For You", "Trending", "Technology", "Business", "Design", "Science"].map((tab, i) => (
                        <button
                            key={tab}
                            className={`py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${i === 0
                                    ? "border-[var(--accent)] text-white"
                                    : "border-transparent text-[var(--muted)] hover:text-white"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </section>

            {/* Feed */}
            <section className="px-6 py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {dummyBlogs.map((blog) => (
                        <BlogCard
                            key={blog.slug}
                            slug={blog.slug}
                            title={blog.title}
                            excerpt={blog.excerpt}
                            author={blog.author}
                            tag={blog.tag}
                            readTime={blog.readTime}
                            coverImage={blog.coverImage ? "/placeholder.jpg" : undefined}
                            rank={blog.rank}
                        />
                    ))}
                </div>
            </section>

            {/* Load More */}
            <section className="px-6 pb-24 text-center">
                <button className="px-8 py-3 border border-white/20 rounded-full text-[var(--muted)] hover:text-white hover:border-white/40 transition-colors">
                    Load More
                </button>
            </section>
        </div>
    );
}
