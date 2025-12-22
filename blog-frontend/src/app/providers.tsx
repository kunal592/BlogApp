"use client";

import { useEffect } from "react";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/motion";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        initSmoothScroll();

        return () => {
            destroySmoothScroll();
        };
    }, []);

    return <>{children}</>;
}
