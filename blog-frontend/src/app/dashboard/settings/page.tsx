"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/auth.store";

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"profile" | "account" | "notifications">("profile");
    const [isSaving, setIsSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || "",
        username: user?.username || "",
        bio: "",
        website: "",
    });

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Implement actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
    };

    const tabs = [
        { id: "profile" as const, label: "Profile", icon: "👤" },
        { id: "account" as const, label: "Account", icon: "🔐" },
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
                <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
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
