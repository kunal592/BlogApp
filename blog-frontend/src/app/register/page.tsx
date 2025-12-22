"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input, Button } from "@/components/ui";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function RegisterPage() {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const user = await authService.register({ email, password, name });
            setUser(user);
            router.push("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
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
                    <h1 className="text-3xl font-bold">Create your account</h1>
                    <p className="mt-2 text-[var(--muted)]">
                        Join the community of thoughtful writers
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
                        label="Name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

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

                    <p className="text-xs text-[var(--muted)]">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="text-[var(--accent)] hover:underline">Terms</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link>.
                    </p>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full"
                    >
                        Create Account
                    </Button>
                </form>

                <div className="mt-8 text-center text-[var(--muted)]">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--accent)] hover:underline">
                        Sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
