"use client";

import { useThemeStore } from "@/store/theme.store";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/5 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <motion.div
                initial={false}
                animate={{
                    rotate: theme === 'dark' ? 0 : 180,
                    scale: 1,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {theme === 'dark' ? (
                    <span className="text-xl">🌙</span>
                ) : (
                    <span className="text-xl">☀️</span>
                )}
            </motion.div>
        </button>
    );
}
