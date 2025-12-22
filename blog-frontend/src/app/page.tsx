"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BlogCard } from "@/components/blog";
import { dummyBlogs } from "@/lib/dummy-data";
import { GradientOrbs, MouseParallax, ScrollReveal, TiltCard } from "@/components/effects";

export default function HomePage() {
  return (
    <>
      {/* Hero Section with Water Effects */}
      <section className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <GradientOrbs />

        {/* Hero content with mouse parallax */}
        <MouseParallax intensity={15}>
          <div className="text-center max-w-3xl relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Ideas that
              <br />
              <span className="text-[var(--accent)]">matter.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-xl text-[var(--muted)] max-w-xl mx-auto"
            >
              A premium platform for thoughtful writing.
              Share knowledge. Build reputation. Get rewarded.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex gap-4 justify-center"
            >
              <Link
                href="/explore"
                className="group relative px-8 py-4 bg-[var(--accent)] text-black font-semibold rounded-full hover:opacity-90 transition-opacity overflow-hidden"
              >
                <span className="relative z-10">Start Reading</span>
              </Link>
              <Link
                href="/write"
                className="px-8 py-4 glass rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                Start Writing
              </Link>
            </motion.div>
          </div>
        </MouseParallax>
      </section>

      {/* Featured Section with Scroll Reveal */}
      <section className="px-6 py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-semibold">Trending Now</h2>
              <Link
                href="/explore"
                className="text-[var(--muted)] hover:text-white transition-colors"
              >
                View all →
              </Link>
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            {dummyBlogs.slice(0, 3).map((blog, i) => (
              <ScrollReveal key={blog.slug} delay={i * 0.1}>
                <TiltCard>
                  <BlogCard
                    slug={blog.slug}
                    title={blog.title}
                    excerpt={blog.excerpt}
                    author={blog.author}
                    tag={blog.tag}
                    readTime={blog.readTime}
                    coverImage={blog.coverImage ? "/placeholder.jpg" : undefined}
                    rank={blog.rank}
                  />
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-32 bg-gradient-to-b from-transparent to-white/[0.02] relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 100%, rgba(94, 158, 255, 0.05) 0%, transparent 50%)",
          }}
        />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-4xl font-bold">
              Ready to share your ideas?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-xl text-[var(--muted)]">
              Join thousands of writers building their audience.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/register"
              className="mt-8 inline-block px-10 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors"
            >
              Create Free Account
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
