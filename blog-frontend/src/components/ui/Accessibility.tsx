"use client";

// Skip to main content link for keyboard users
export function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--accent)] focus:text-black focus:rounded-lg focus:font-medium"
        >
            Skip to main content
        </a>
    );
}

// Screen reader only announcement
export function SROnly({ children }: { children: React.ReactNode }) {
    return <span className="sr-only">{children}</span>;
}

// Live region for dynamic announcements
export function LiveRegion({
    message,
    type = "polite"
}: {
    message?: string;
    type?: "polite" | "assertive"
}) {
    return (
        <div
            role="status"
            aria-live={type}
            aria-atomic="true"
            className="sr-only"
        >
            {message}
        </div>
    );
}

// Focus trap utility hook
import { useEffect, useRef } from "react";

export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const focusableElements = containerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        firstElement?.focus();
        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isActive]);

    return containerRef;
}

// Keyboard shortcut handler
export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    options: { ctrl?: boolean; meta?: boolean; shift?: boolean } = {}
) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key.toLowerCase() === key.toLowerCase() &&
                (!options.ctrl || e.ctrlKey) &&
                (!options.meta || e.metaKey) &&
                (!options.shift || e.shiftKey)
            ) {
                e.preventDefault();
                callback();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [key, callback, options]);
}
