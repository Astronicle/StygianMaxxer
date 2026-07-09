"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiGetMyProfile,
  apiGetMyPosts,
  apiUpdateMyProfile,
  getToken,
  clearToken,
  type AccountProfile,
  type PostSummary,
} from "../lib/api";
import { avatarIconUrl } from "../lib/avatar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardPostCard from "../components/dashboard/DashboardPostCard";
import AvatarPickerModal from "../components/dashboard/AvatarPickerModal";

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  useEffect(() => {
    // No token → redirect to login immediately
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        // 1) Fetch the logged-in user's profile (JWT required)
        //    Response: { accountId, username, email, avatarCharId, avatarCharName, avatarCharSlug, creationDate }
        const me = await apiGetMyProfile();
        setProfile(me);

        // 2) Now that we have accountId, fetch their posts
        //    GET /api/posts?accountId=<id>&size=50
        const postsPage = await apiGetMyPosts(me.accountId);
        setPosts(postsPage.content);
      } catch (err) {
        // 401 = JWT expired or invalid → clear and redirect
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

  // Persist the chosen avatar to the backend, then update local state so the
  // header reflects the change immediately without a refetch.
  async function handleAvatarSelect(charId: number) {
    const updated = await apiUpdateMyProfile({ avatarCharId: charId });
    setProfile(updated);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-10">
      <DashboardHeader
        username={profile!.username}
        // Build avatar URL from the character's slug — falls back to the
        // default Traveler avatar if the account has none set.
        charIcon={avatarIconUrl(profile!.avatarCharSlug)}
        onAvatarClick={() => setAvatarPickerOpen(true)}
      />

      <AvatarPickerModal
        open={avatarPickerOpen}
        currentCharId={profile!.avatarCharId}
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={handleAvatarSelect}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Posts</h2>
        </div>

        {posts.length === 0 ? (
          <div className="alert alert-info">You haven&apos;t created any posts yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <DashboardPostCard
                key={post.postId}
                postID={post.postId}
                title={post.title}
                description={post.stygianName}
                difficulty={post.difficulty}
                rating={post.averageRating ?? 0}
                createdAt={post.createdAt}
                onDeleted={(deletedId) =>
                  setPosts((prev) => prev.filter((p) => p.postId !== deletedId))
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
