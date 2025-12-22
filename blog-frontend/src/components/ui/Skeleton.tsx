"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={cn("bg-white/5 rounded-lg", className)}
        />
    );
}

// Blog Card Skeleton
export function BlogCardSkeleton() {
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <Skeleton className="aspect-[2/1] rounded-none" />
            <div className="p-8 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-3 pt-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Blog Page Skeleton
export function BlogPageSkeleton() {
    return (
        <div className="min-h-screen pt-20 px-6">
            <div className="max-w-3xl mx-auto">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-3/4 mb-8" />

                <div className="flex items-center gap-4 mb-12">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>

                <Skeleton className="aspect-[2/1] rounded-2xl mb-12" />

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-5 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Explore Feed Skeleton
export function ExploreFeedSkeleton() {
    return (
        <div className="space-y-8">
            {[1, 2, 3].map((i) => (
                <BlogCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="glass-subtle rounded-2xl p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                </div>
            ))}
        </div>
    );
}
