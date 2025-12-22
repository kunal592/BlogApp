"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { scrollY } = useScroll();

    // Blur increases as user scrolls
    const blur = useTransform(scrollY, [0, 100], [12, 24]);
    const opacity = useTransform(scrollY, [0, 100], [0.6, 0.95]);

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                backdropFilter: useTransform(blur, (v) => `blur(${v}px) saturate(180%)`),
            }}
        >
            <motion.div
                className="border-b border-white/10"
                style={{
                    backgroundColor: useTransform(opacity, (v) => `rgba(11, 11, 12, ${v})`),
                }}
            >
                <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-semibold tracking-tight">
                        Blog<span className="text-[var(--accent)]">.</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/explore"
                            className="text-sm text-[var(--muted)] hover:text-white transition-colors"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm text-[var(--muted)] hover:text-white transition-colors"
                        >
                            Login
                        </Link>
                        <Link
                            href="/write"
                            className="text-sm px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
                        >
                            Write
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 -mr-2"
                        aria-label="Toggle menu"
                    >
                        <div className="w-5 flex flex-col gap-1">
                            <motion.span
                                className="block h-0.5 bg-white rounded-full"
                                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
                            />
                            <motion.span
                                className="block h-0.5 bg-white rounded-full"
                                animate={{ opacity: isOpen ? 0 : 1 }}
                            />
                            <motion.span
                                className="block h-0.5 bg-white rounded-full"
                                animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
                            />
                        </div>
                    </button>
                </nav>

                {/* Mobile Menu */}
                <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    className="md:hidden overflow-hidden"
                >
                    <div className="px-6 py-4 flex flex-col gap-4 border-t border-white/10">
                        <Link
                            href="/explore"
                            className="text-[var(--muted)] hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Explore
                        </Link>
                        <Link
                            href="/login"
                            className="text-[var(--muted)] hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Login
                        </Link>
                        <Link
                            href="/write"
                            className="text-center py-3 bg-white text-black rounded-full font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Write
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </motion.header>
    );
}
