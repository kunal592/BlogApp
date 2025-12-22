export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="glass px-12 py-10 rounded-3xl max-w-xl text-center">
          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Ideas that
            <br />
            <span className="text-[var(--accent)]">matter.</span>
          </h1>
          <p className="mt-6 text-[var(--muted)] text-lg leading-relaxed">
            A premium platform for thoughtful writing.
            Share knowledge. Build reputation. Get rewarded.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <button className="px-8 py-3 bg-[var(--accent)] text-black font-semibold rounded-full hover:opacity-90 transition-opacity">
              Start Reading
            </button>
            <button className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors">
              Start Writing
            </button>
          </div>
        </div>
      </section>

      {/* Scroll Test Section */}
      <section className="min-h-screen px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8">Featured Reads</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <article
                key={i}
                className="glass-subtle p-8 rounded-2xl hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <span className="text-sm text-[var(--accent)]">Technology</span>
                <h3 className="text-xl font-semibold mt-2">
                  The Future of AI-Powered Content Creation
                </h3>
                <p className="mt-3 text-[var(--muted)] line-clamp-2">
                  Exploring how artificial intelligence is transforming the way we write,
                  edit, and publish content in the digital age.
                </p>
                <div className="mt-4 flex items-center gap-3 text-sm text-[var(--muted)]">
                  <span>John Doe</span>
                  <span>·</span>
                  <span>5 min read</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Another Section for More Scroll */}
      <section className="min-h-screen px-6 py-24 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold">Join the Community</h2>
          <p className="mt-4 text-[var(--muted)] text-lg max-w-xl mx-auto">
            Connect with thousands of writers and readers sharing insights
            on technology, business, and creativity.
          </p>
          <button className="mt-8 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors">
            Create Account
          </button>
        </div>
      </section>
    </>
  );
}
