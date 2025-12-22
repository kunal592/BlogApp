"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const navItems = [
    { label: "Overview", href: "/dashboard", icon: "📊" },
    { label: "My Articles", href: "/dashboard/articles", icon: "📝" },
    { label: "Earnings", href: "/dashboard/earnings", icon: "💰" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "📈" },
    { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-white/10 bg-[#0B0B0C] hidden lg:block">
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--muted)] hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                {children}
            </main>
        </div>
    );
}
