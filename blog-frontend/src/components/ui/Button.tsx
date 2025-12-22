"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", isLoading, className, children, disabled, type = "button", onClick }, ref) => {
        const variants = {
            primary: "bg-[var(--accent)] text-black hover:opacity-90",
            secondary: "glass hover:bg-white/10",
            ghost: "hover:bg-white/5",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3",
            lg: "px-8 py-4 text-lg",
        };

        return (
            <motion.button
                ref={ref}
                type={type}
                onClick={onClick}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "rounded-full font-medium transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Loading...
                    </span>
                ) : (
                    children
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
