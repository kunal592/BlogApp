"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

export function Navbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    const { user, isAuthenticated, logout, setUser, setLoading } = useAuthStore();

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const me = await authService.getMe();
                setUser(me);
            } catch {
                // Not logged in or token expired
                setLoading(false);
            }
        };
        checkAuth();
    }, [setUser, setLoading]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch {
            // Ignore errors, logout anyway
        }
        logout();
        setIsUserMenuOpen(false);
        router.push("/");
    };

    // Blur increases as user scrolls
    const blur = useTransform(scrollY, [0, 100], [12, 24]);
    const opacity = useTransform(scrollY, [0, 100], [0.6, 0.95]);

    const userInitial = user?.name?.charAt(0) || user?.email?.charAt(0) || "?";

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

                        {isAuthenticated && user ? (
                            <>
                                <Link
                                    href="/write"
                                    className="text-sm px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
                                >
                                    Write
                                </Link>

                                {/* User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 group"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name || "User"}
                                                className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-[var(--accent)] transition-colors"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-black font-semibold text-sm">
                                                {userInitial.toUpperCase()}
                                            </div>
                                        )}
                                        <motion.span
                                            animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                                            className="text-[var(--muted)] text-xs"
                                        >
                                            ▼
                                        </motion.span>
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 mt-2 w-56 py-2 rounded-xl bg-[#1a1a1c] border border-white/10 shadow-xl"
                                            >
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-white/10">
                                                    <p className="font-medium truncate">{user.name || user.username || "User"}</p>
                                                    <p className="text-sm text-[var(--muted)] truncate">{user.email}</p>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-1">
                                                    <Link
                                                        href="/dashboard"
                                                        className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition-colors"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        📊 Dashboard
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/articles"
                                                        className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition-colors"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        📝 My Articles
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/settings"
                                                        className="block px-4 py-2 text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition-colors"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        ⚙️ Settings
                                                    </Link>
                                                </div>

                                                {/* Logout */}
                                                <div className="border-t border-white/10 pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                                    >
                                                        🚪 Log out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
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

                        {isAuthenticated && user ? (
                            <>
                                {/* User info for mobile */}
                                <div className="flex items-center gap-3 py-2">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name || "User"}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-black font-semibold">
                                            {userInitial.toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{user.name || user.username || "User"}</p>
                                        <p className="text-sm text-[var(--muted)]">{user.email}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/dashboard"
                                    className="text-[var(--muted)] hover:text-white transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/write"
                                    className="text-center py-3 bg-white text-black rounded-full font-medium"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Write
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="text-left text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </motion.header>
    );
}

