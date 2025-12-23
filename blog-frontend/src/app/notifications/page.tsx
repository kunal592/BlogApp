"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { notificationService, Notification } from "@/services/notification.service";
import { Button } from "@/components/ui";
import Link from "next/link";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await notificationService.getAll();
                setNotifications(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load notifications");
            } finally {
                setLoading(false);
            }
        };
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (err) {
            console.error("Mark as read error:", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Mark all as read error:", err);
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'FOLLOW': return '👤';
            case 'LIKE': return '❤️';
            case 'COMMENT': return '💬';
            case 'REPLY': return '↩️';
            case 'PURCHASE': return '💰';
            case 'SYSTEM': return '🔔';
            default: return '📌';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-8" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-subtle rounded-xl p-4 animate-pulse">
                                <div className="h-5 w-3/4 bg-white/10 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-24 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    {notifications.some(n => !n.isRead) && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                )}

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="text-center py-16 glass-subtle rounded-xl">
                        <p className="text-4xl mb-4">🔔</p>
                        <p className="text-[var(--muted)]">No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`glass-subtle rounded-xl p-4 ${!notification.isRead ? 'border-l-4 border-[var(--accent)]' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-2xl">{getIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-medium">{notification.title}</p>
                                                <p className="text-sm text-[var(--muted)]">{notification.message}</p>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs text-[var(--muted)] hover:text-white shrink-0"
                                                >
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-[var(--muted)]">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    className="text-xs text-[var(--accent)] hover:underline"
                                                >
                                                    View
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
