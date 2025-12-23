"use client";

import { useEffect } from "react";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/motion";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        // Add lenis class to html element
        document.documentElement.classList.add('lenis', 'lenis-smooth');

        initSmoothScroll();

        return () => {
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
            destroySmoothScroll();
        };
    }, []);

    return <>{children}</>;
}

