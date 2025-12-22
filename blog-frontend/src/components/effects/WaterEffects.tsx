"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

// Animated gradient orbs for hero sections
export function GradientOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Primary orb */}
            <motion.div
                animate={{
                    x: [0, 30, -20, 0],
                    y: [0, -40, 20, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(94, 158, 255, 0.15) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />
            {/* Secondary orb */}
            <motion.div
                animate={{
                    x: [0, -40, 30, 0],
                    y: [0, 30, -20, 0],
                    scale: [1, 0.9, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />
            {/* Accent orb */}
            <motion.div
                animate={{
                    x: [0, 20, -30, 0],
                    y: [0, -20, 30, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5,
                }}
                className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />
        </div>
    );
}

// Mouse parallax effect for hero content
export function MouseParallax({ children, intensity = 0.02 }: { children: React.ReactNode; intensity?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const x = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20 * intensity, 20 * intensity]), springConfig);
    const y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20 * intensity, 20 * intensity]), springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;
            const rect = ref.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            mouseX.set((e.clientX - centerX) / rect.width);
            mouseY.set((e.clientY - centerY) / rect.height);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div ref={ref} style={{ x, y }}>
            {children}
        </motion.div>
    );
}

// Ripple effect on click/tap
export function Ripple({ className }: { className?: string }) {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
    };

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`} onClick={handleClick}>
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute w-16 h-16 rounded-full bg-white/20 pointer-events-none"
                    style={{
                        left: ripple.x - 32,
                        top: ripple.y - 32,
                    }}
                />
            ))}
        </div>
    );
}

import { useState } from "react";

// Scroll-triggered section reveal
export function ScrollReveal({
    children,
    delay = 0,
    direction = "up"
}: {
    children: React.ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}) {
    const directionMap = {
        up: { y: 40 },
        down: { y: -40 },
        left: { x: 40 },
        right: { x: -40 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directionMap[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

// Card with subtle 3D tilt on hover
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 300 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);
        rotateX.set(-y * 5);
        rotateY.set(x * 5);
    };

    const handleMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: springRotateX,
                rotateY: springRotateY,
                transformPerspective: 1000,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Subtle glow effect on hover
export function GlowCard({ children, className }: { children: React.ReactNode; className?: string }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            className={`relative overflow-hidden ${className}`}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(94, 158, 255, 0.1), transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
}
