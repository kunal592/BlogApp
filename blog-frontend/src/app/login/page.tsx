"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input, Button } from "@/components/ui";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const user = await authService.login({ email, password });
            setUser(user);
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold">Welcome back</h1>
                    <p className="mt-2 text-[var(--muted)]">
                        Sign in to continue to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-[var(--muted)]">
                            <input type="checkbox" className="rounded" />
                            Remember me
                        </label>
                        <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="mt-8 text-center text-[var(--muted)]">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-[var(--accent)] hover:underline">
                        Create one
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
