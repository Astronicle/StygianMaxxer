"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  apiGetProfileByUsername,
  apiGetMyPosts,
  type AccountProfile,
  type PostSummary,
} from "@/app/lib/api";
import { avatarIconUrl } from "@/app/lib/avatar";
import UserHeader from "@/app/components/user/UserHeader";
import PostCard from "@/app/components/user/PostCard";

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // GET /api/accounts/by-username/{username} — public profile lookup
        const accountProfile = await apiGetProfileByUsername(username);
        setProfile(accountProfile);

        // GET /api/posts?accountId={id}&size=50 — this user's posts.
        // apiGetMyPosts is misleadingly named but just filters by accountId
        // and is public, so it works for any user's profile.
        const postsPage = await apiGetMyPosts(accountProfile.accountId);
        setPosts(postsPage.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">{error ?? "User not found"}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <UserHeader
        username={profile.username}
        charIcon={avatarIconUrl(profile.avatarCharSlug)}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Posts by {profile.username}</h2>

        {posts.length === 0 ? (
          <div className="alert alert-info">
            This user hasn&apos;t posted anything yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.postId} href={`/post/${post.postId}`} className="h-full">
                <PostCard post={post} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
