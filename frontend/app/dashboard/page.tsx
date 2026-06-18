"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiGetMyProfile,
  apiGetMyPosts,
  getToken,
  clearToken,
  type AccountProfile,
  type PostSummary,
} from "../lib/api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardPostCard from "../components/dashboard/DashboardPostCard";

export default function DashboardPage() {
  const router = useRouter();

  // Separate state for profile and posts so we can fetch them in parallel
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there's no token at all, kick to login immediately — no point fetching
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        // Fetch profile first so we have the accountId, then fetch posts in parallel
        const me = await apiGetMyProfile();
        setProfile(me);

        // Now that we have the accountId, fetch that user's posts
        const postsPage = await apiGetMyPosts(me.accountId);
        setPosts(postsPage.content);
      } catch (err) {
        // A 401 means the token is expired or invalid — clear it and redirect
        if (err instanceof Error && err.message.includes("401")) {
          clearToken();
          router.push("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <DashboardHeader
        username={profile!.username}
        // avatarCharId will be wired to a real icon URL in a later step
        charIcon={
          profile!.avatarCharId
            ? `${process.env.NEXT_PUBLIC_ICON_BASE_URL}${profile!.avatarCharName}`
            : "/icon.png"
        }
      />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Posts</h2>

        {posts.length === 0 ? (
          <div className="alert alert-info">You haven't created any posts yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <DashboardPostCard
                key={post.postId}
                postID={post.postId}
                title={post.title}
                description={post.stygianName}
                rating={post.averageRating ?? 0}
                createdAt={post.createdAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}