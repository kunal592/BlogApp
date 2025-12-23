"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/auth.store";
import { userService } from "@/services/user.service";

export default function SettingsPage() {
    const { user, setUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"profile" | "account" | "creator" | "notifications">("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    const [upgradeSuccess, setUpgradeSuccess] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || "",
        username: user?.username || "",
        bio: "",
        website: "",
    });

    // Update profile state when user changes
    useEffect(() => {
        if (user) {
            setProfile(p => ({
                ...p,
                name: user.name || "",
                username: user.username || "",
            }));
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await userService.updateProfile({
                name: profile.name,
                username: profile.username,
                bio: profile.bio || undefined,
            });
            setUser({ ...user!, ...updated });
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgradeToCreator = async () => {
        setIsUpgrading(true);
        setUpgradeError(null);
        try {
            const updated = await userService.upgradeToCreator();
            setUser({ ...user!, role: updated.role });
            setUpgradeSuccess(true);
        } catch (err: any) {
            setUpgradeError(err.message || "Failed to upgrade to creator");
        } finally {
            setIsUpgrading(false);
        }
    };

    const isCreator = user?.role === 'CREATOR' || user?.role === 'ADMIN' || user?.role === 'OWNER';

    const tabs = [
        { id: "profile" as const, label: "Profile", icon: "👤" },
        { id: "account" as const, label: "Account", icon: "🔐" },
        { id: "creator" as const, label: "Creator", icon: "✍️" },
        { id: "notifications" as const, label: "Notifications", icon: "🔔" },
    ];

    return (
        <div className="min-h-screen pt-8 pb-24 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-[var(--muted)] mt-1">Manage your account and preferences</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white/10 text-white'
                                : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === "profile" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Avatar */}
                        <div className="glass-subtle rounded-xl p-6">
                            <h3 className="font-medium mb-4">Profile Picture</h3>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center text-2xl font-bold text-black">
                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <Button variant="secondary" size="sm">Upload Image</Button>
                                    <p className="text-sm text-[var(--muted)] mt-2">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="glass-subtle rounded-xl p-6 space-y-4">
                            <h3 className="font-medium mb-4">Profile Information</h3>
                            <Input
                                label="Display Name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                placeholder="Your display name"
                            />
                            <Input
                                label="Username"
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                placeholder="username"
                            />
                            <div>
                                <label className="block text-sm text-[var(--muted)] mb-2">Bio</label>
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell readers about yourself..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--accent)] focus:outline-none resize-none"
                                />
                            </div>
                            <Input
                                label="Website"
                                value={profile.website}
                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                placeholder="https://yourwebsite.com"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                isLoading={isSaving}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Account Tab */}
                {activeTab === "account" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="glass-subtle rounded-xl p-6">
                            <h3 className="font-medium mb-4">Email Address</h3>
                            <p className="text-[var(--muted)]">{user?.email}</p>
                            <Button variant="ghost" size="sm" className="mt-3">Change Email</Button>
                        </div>

                        <div className="glass-subtle rounded-xl p-6">
                            <h3 className="font-medium mb-4">Password</h3>
                            <p className="text-[var(--muted)]">Last changed 30 days ago</p>
                            <Button variant="ghost" size="sm" className="mt-3">Change Password</Button>
                        </div>

                        <div className="glass-subtle rounded-xl p-6 border-red-500/20">
                            <h3 className="font-medium text-red-400 mb-4">Danger Zone</h3>
                            <p className="text-[var(--muted)] mb-4">Once you delete your account, there is no going back.</p>
                            <Button variant="ghost" size="sm" className="text-red-400 border-red-400/20 hover:bg-red-500/10">
                                Delete Account
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Creator Tab */}
                {activeTab === "creator" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {isCreator ? (
                            <>
                                {/* Already a Creator */}
                                <div className="glass-subtle rounded-xl p-8 text-center border border-[var(--accent)]/30">
                                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-3xl">✓</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--accent)]">You're a Creator!</h3>
                                    <p className="text-[var(--muted)] mt-2">
                                        You can write and publish blogs, including premium content.
                                    </p>
                                </div>

                                <div className="glass-subtle rounded-xl p-6">
                                    <h3 className="font-medium mb-4">Creator Benefits</h3>
                                    <ul className="space-y-3 text-[var(--muted)]">
                                        <li className="flex items-center gap-3">
                                            <span className="text-[var(--accent)]">✓</span>
                                            <span>Publish unlimited articles</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="text-[var(--accent)]">✓</span>
                                            <span>Create premium/exclusive content</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="text-[var(--accent)]">✓</span>
                                            <span>Earn 80% from content sales</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="text-[var(--accent)]">✓</span>
                                            <span>Access to analytics dashboard</span>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Upgrade to Creator */}
                                <div className="glass-subtle rounded-xl p-8">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-500 flex items-center justify-center mx-auto mb-4">
                                            <span className="text-3xl">✍️</span>
                                        </div>
                                        <h3 className="text-2xl font-bold">Become a Creator</h3>
                                        <p className="text-[var(--muted)] mt-2 max-w-md mx-auto">
                                            Start writing, share your knowledge, and earn money from premium content.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <span className="text-2xl mb-2 block">📝</span>
                                            <h4 className="font-medium">Write & Publish</h4>
                                            <p className="text-sm text-[var(--muted)] mt-1">Create articles with our rich editor</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <span className="text-2xl mb-2 block">💰</span>
                                            <h4 className="font-medium">Earn Money</h4>
                                            <p className="text-sm text-[var(--muted)] mt-1">Get 80% of premium content sales</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <span className="text-2xl mb-2 block">📊</span>
                                            <h4 className="font-medium">Analytics</h4>
                                            <p className="text-sm text-[var(--muted)] mt-1">Track views, likes and earnings</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5">
                                            <span className="text-2xl mb-2 block">👥</span>
                                            <h4 className="font-medium">Build Audience</h4>
                                            <p className="text-sm text-[var(--muted)] mt-1">Grow your follower base</p>
                                        </div>
                                    </div>

                                    {upgradeError && (
                                        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
                                            {upgradeError}
                                        </div>
                                    )}

                                    {upgradeSuccess ? (
                                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-center">
                                            🎉 Congratulations! You're now a Creator. Start writing!
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            {!profile.username && (
                                                <p className="text-sm text-yellow-400 mb-4">
                                                    ⚠️ You need to set a username first. Go to Profile tab.
                                                </p>
                                            )}
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                onClick={handleUpgradeToCreator}
                                                isLoading={isUpgrading}
                                                disabled={!profile.username}
                                            >
                                                Become a Creator (Free)
                                            </Button>
                                            <p className="text-xs text-[var(--muted)] mt-3">
                                                No payment required. Start creating immediately.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="glass-subtle rounded-xl p-6">
                            <h3 className="font-medium mb-4">Email Notifications</h3>
                            <div className="space-y-4">
                                {[
                                    { label: "New followers", description: "When someone follows you" },
                                    { label: "Comments", description: "When someone comments on your article" },
                                    { label: "Likes", description: "When someone likes your article" },
                                    { label: "Weekly digest", description: "Summary of your performance" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{item.label}</p>
                                            <p className="text-sm text-[var(--muted)]">{item.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
