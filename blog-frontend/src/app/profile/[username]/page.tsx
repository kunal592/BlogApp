"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { userService, PublicProfile } from "@/services/user.service";
import { blogService, Blog } from "@/services/blog.service";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/store/auth.store";

export default function ProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const { user: currentUser } = useAuthStore();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await userService.getPublicProfile(username);
                setProfile(data);
                setIsFollowing(data.isFollowing || false);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Profile not found");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [username]);

    const handleFollow = async () => {
        if (!profile || !currentUser) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await userService.unfollow(profile.id);
                setIsFollowing(false);
                setProfile(p => p ? { ...p, followerCount: p.followerCount - 1 } : null);
            } else {
                await userService.follow(profile.id);
                setIsFollowing(true);
                setProfile(p => p ? { ...p, followerCount: p.followerCount + 1 } : null);
            }
        } catch (err) {
            console.error("Follow error:", err);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-white/10" />
                            <div className="flex-1">
                                <div className="h-8 w-48 bg-white/10 rounded mb-2" />
                                <div className="h-4 w-32 bg-white/10 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
                    <p className="text-[var(--muted)]">{error || "User doesn't exist"}</p>
                    <Link href="/" className="text-[var(--accent)] hover:underline mt-4 inline-block">
                        Go home
                    </Link>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="min-h-screen pt-24 pb-24 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start gap-6 mb-12"
                >
                    {/* Avatar */}
                    {profile.avatar ? (
                        <img
                            src={profile.avatar}
                            alt={profile.name || profile.username || "User"}
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center text-3xl font-bold text-black">
                            {(profile.name || profile.username || "U").charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-3xl font-bold">{profile.name || profile.username || "Anonymous"}</h1>
                            {profile.role === 'CREATOR' && (
                                <span className="px-2 py-0.5 text-xs bg-[var(--accent)]/20 text-[var(--accent)] rounded-full">
                                    Creator
                                </span>
                            )}
                        </div>
                        {profile.username && (
                            <p className="text-[var(--muted)] mb-3">@{profile.username}</p>
                        )}
                        {profile.bio && (
                            <p className="text-lg mb-4">{profile.bio}</p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-4">
                            <div>
                                <span className="font-bold">{profile.followerCount}</span>
                                <span className="text-[var(--muted)] ml-1">Followers</span>
                            </div>
                            <div>
                                <span className="font-bold">{profile.followingCount}</span>
                                <span className="text-[var(--muted)] ml-1">Following</span>
                            </div>
                            <div>
                                <span className="font-bold">{profile.blogCount}</span>
                                <span className="text-[var(--muted)] ml-1">Articles</span>
                            </div>
                        </div>

                        {/* Actions */}
                        {!isOwnProfile && currentUser && (
                            <Button
                                variant={isFollowing ? "secondary" : "primary"}
                                onClick={handleFollow}
                                disabled={followLoading}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </Button>
                        )}
                        {isOwnProfile && (
                            <Link href="/dashboard/settings">
                                <Button variant="secondary">Edit Profile</Button>
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Articles Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-6">Articles</h2>
                    {profile.blogCount === 0 ? (
                        <div className="text-center py-12 glass-subtle rounded-xl">
                            <p className="text-[var(--muted)]">No articles yet</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 glass-subtle rounded-xl">
                            <p className="text-[var(--muted)]">Articles will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
