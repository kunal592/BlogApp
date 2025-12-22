"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

interface EarningsData {
    balance: number;
    pendingPayout: number;
    lifetimeEarnings: number;
    thisMonth: number;
    lastMonth: number;
    transactions: Transaction[];
}

interface Transaction {
    id: string;
    type: "earning" | "withdrawal" | "tip";
    amount: number;
    description: string;
    date: string;
    status: "completed" | "pending";
}

// Dummy data
const dummyEarnings: EarningsData = {
    balance: 12450,
    pendingPayout: 3200,
    lifetimeEarnings: 145600,
    thisMonth: 8750,
    lastMonth: 6200,
    transactions: [
        { id: "1", type: "earning", amount: 250, description: "Article: Future of AI", date: "Dec 22", status: "completed" },
        { id: "2", type: "earning", amount: 180, description: "Article: Building in Public", date: "Dec 21", status: "completed" },
        { id: "3", type: "tip", amount: 500, description: "Tip from @reader123", date: "Dec 20", status: "completed" },
        { id: "4", type: "withdrawal", amount: -5000, description: "Bank withdrawal", date: "Dec 18", status: "completed" },
        { id: "5", type: "earning", amount: 320, description: "Article: Design Systems", date: "Dec 17", status: "pending" },
    ],
};

export default function EarningsPage() {
    const [earnings] = useState<EarningsData>(dummyEarnings);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const percentChange = earnings.lastMonth > 0
        ? Math.round(((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100)
        : 0;

    return (
        <div className="min-h-screen pt-8 pb-24 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Earnings</h1>
                    <p className="text-[var(--muted)] mt-1">Track your revenue and manage payouts</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard
                        label="Available Balance"
                        value={`₹${earnings.balance.toLocaleString()}`}
                        action={
                            <Button size="sm" onClick={() => setShowWithdrawModal(true)}>
                                Withdraw
                            </Button>
                        }
                    />
                    <StatCard
                        label="This Month"
                        value={`₹${earnings.thisMonth.toLocaleString()}`}
                        change={percentChange}
                    />
                    <StatCard
                        label="Lifetime Earnings"
                        value={`₹${earnings.lifetimeEarnings.toLocaleString()}`}
                        subtitle="Since Dec 2023"
                    />
                </div>

                {/* Earnings Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Placeholder */}
                    <div className="lg:col-span-2 glass-subtle rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-6">Earnings Over Time</h2>
                        <div className="h-64 flex items-end justify-around gap-2">
                            {[40, 65, 45, 80, 55, 90, 75, 60, 85, 70, 95, 88].map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                    className="flex-1 bg-[var(--accent)]/30 rounded-t hover:bg-[var(--accent)]/50 transition-colors cursor-pointer"
                                    title={`Month ${i + 1}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-[var(--muted)]">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                            <span>Nov</span>
                            <span>Dec</span>
                        </div>
                    </div>

                    {/* Revenue Split */}
                    <div className="glass-subtle rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-6">Revenue Split</h2>
                        <div className="space-y-4">
                            <SplitRow label="Your Share (70%)" value={8750 * 0.7} color="var(--accent)" />
                            <SplitRow label="Platform (30%)" value={8750 * 0.3} color="white/30" />
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <p className="text-xs text-[var(--muted)]">
                                You keep 70% of all earnings. Platform fee covers hosting, payments, and support.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="mt-8 glass-subtle rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-6">Recent Transactions</h2>
                    <div className="space-y-3">
                        {earnings.transactions.map((tx) => (
                            <TransactionRow key={tx.id} transaction={tx} />
                        ))}
                    </div>
                </div>

                {/* Withdraw Modal */}
                {showWithdrawModal && (
                    <WithdrawModal
                        balance={earnings.balance}
                        onClose={() => setShowWithdrawModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    change,
    subtitle,
    action,
}: {
    label: string;
    value: string;
    change?: number;
    subtitle?: string;
    action?: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-subtle rounded-2xl p-6"
        >
            <p className="text-sm text-[var(--muted)] mb-2">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change !== undefined && (
                <p className={`text-sm mt-2 ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs last month
                </p>
            )}
            {subtitle && (
                <p className="text-xs text-white/30 mt-2">{subtitle}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </motion.div>
    );
}

function SplitRow({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color.includes("var") ? `var(--accent)` : `rgba(255,255,255,0.3)` }}
                />
                <span className="text-sm text-[var(--muted)]">{label}</span>
            </div>
            <span className="font-medium">₹{value.toLocaleString()}</span>
        </div>
    );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
    const icons = {
        earning: "💰",
        withdrawal: "🏦",
        tip: "❤️",
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-4">
                <span className="text-xl">{icons[transaction.type]}</span>
                <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-[var(--muted)]">{transaction.date}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-medium ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                </p>
                {transaction.status === "pending" && (
                    <span className="text-xs text-yellow-400">Pending</span>
                )}
            </div>
        </div>
    );
}

function WithdrawModal({ balance, onClose }: { balance: number; onClose: () => void }) {
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleWithdraw = async () => {
        setIsProcessing(true);
        // TODO: Implement actual withdrawal
        await new Promise((r) => setTimeout(r, 2000));
        setIsProcessing(false);
        onClose();
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
                <div className="glass p-6 rounded-2xl m-4">
                    <h3 className="text-xl font-semibold mb-2">Withdraw Funds</h3>
                    <p className="text-[var(--muted)] text-sm mb-6">
                        Available: ₹{balance.toLocaleString()}
                    </p>

                    <div className="mb-6">
                        <label className="text-sm text-[var(--muted)] block mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                max={balance}
                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-medium focus:outline-none focus:border-[var(--accent)]"
                            />
                        </div>
                        <button
                            onClick={() => setAmount(balance.toString())}
                            className="mt-2 text-sm text-[var(--accent)] hover:underline"
                        >
                            Withdraw all
                        </button>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                        <p className="text-xs text-[var(--muted)]">
                            Withdrawals are processed within 2-3 business days to your linked bank account.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            disabled={!amount || Number(amount) <= 0 || Number(amount) > balance || isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? "Processing..." : "Withdraw"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
