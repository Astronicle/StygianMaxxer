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

// Supabase character icon base URL — e.g. .../assets/character
// Icon path pattern: <CHAR_ICON_BASE>/<charSlug>/icon.webp
const CHAR_ICON_BASE = process.env.NEXT_PUBLIC_CHAR_ICON_BASE_URL ?? "";

function buildCharIconUrl(charName: string | null): string {
  if (!charName || !CHAR_ICON_BASE) return "/icon.png";
  // avatarCharName from the backend is the character name (e.g. "Rover")
  // Supabase stores icons at: <base>/<charName>/icon.webp
  return `${CHAR_ICON_BASE}/${charName}/icon.webp`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No token → redirect to login immediately
    if (!getToken()) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        // 1) Fetch the logged-in user's profile (JWT required)
        //    Response: { accountId, username, email, avatarCharId, avatarCharName, creationDate }
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
        // Build avatar URL from avatarCharName (the slug the backend returns).
        // Falls back to the app icon if no avatar is set.
        charIcon={buildCharIconUrl(profile!.avatarCharName)}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Posts</h2>
        </div>

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
