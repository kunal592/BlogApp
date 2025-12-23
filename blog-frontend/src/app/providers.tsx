"use client";

import { useEffect } from "react";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/motion";
import { useThemeStore } from "@/store/theme.store";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme } = useThemeStore();

    useEffect(() => {
        // Add lenis class to html element
        document.documentElement.classList.add('lenis', 'lenis-smooth');

        initSmoothScroll();

        return () => {
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
            destroySmoothScroll();
        };
    }, []);

    // Apply theme on mount and when it changes
    useEffect(() => {
        const html = document.documentElement;
        if (theme === 'light') {
            html.classList.remove('dark');
            html.classList.add('light');
        } else {
            html.classList.remove('light');
            html.classList.add('dark');
        }
    }, [theme]);

    return <>{children}</>;
}
