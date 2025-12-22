"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-[var(--muted)]">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-3 rounded-xl",
                        "bg-white/[0.04] border border-white/10",
                        "text-white placeholder:text-white/30",
                        "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20",
                        "transition-all duration-200",
                        error && "border-red-500/50 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
