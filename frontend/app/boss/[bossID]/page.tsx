"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  apiGetBoss,
  apiGetPosts,
  type Boss,
  type PostSummary,
  type Page,
} from "@/app/lib/api";
import BossDetailHeader from "@/app/components/boss/BossDetailHeader";
import BossPostCard from "@/app/components/boss/BossPostCard";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";

export default function BossDetailPage() {
  const { bossID } = useParams<{ bossID: string }>();
  const bossId = Number(bossID);

  const [boss, setBoss] = useState<Boss | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // The boss lookup endpoint is GET /api/bosses/{slug} — but we only have the numeric id
        // from the URL. So we fetch all bosses and find the one with the matching id.
        // Alternative: use GET /api/bosses and cache — fine for a small list.
        const { apiFetch } = await import("@/app/lib/api");
        const allBosses = await apiFetch<Boss[]>("/api/bosses");
        const found = allBosses.find((b) => b.id === bossId);

        if (!found) {
          setError("Boss not found");
          return;
        }
        setBoss(found);

        // GET /api/posts?bossId={id}&page=0&size=12
        // PostController accepts bossId as Short
        const postsPage = await apiGetPostsByBoss(bossId, 0);
        setPosts(postsPage.content);
        setTotalPages(postsPage.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load boss");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bossId]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await apiGetPostsByBoss(bossId, nextPage);
      setPosts((prev) => [...prev, ...data.content]);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !boss) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">{error ?? "Boss not found"}</div>
      </div>
    );
  }

  const hasMore = page < totalPages - 1;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Header — shows boss icon and name */}
      <BossDetailHeader
        name={boss.name}
        icon={`${BOSS_ICON_BASE}/${boss.slug}/model.webp`}
      />

      {/* Posts filtered by this boss */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Posts featuring {boss.name}</h2>

        {posts.length === 0 ? (
          <div className="alert alert-info">
            No posts available for this boss yet.
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link key={post.postId} href={`/post/${post.postId}`}>
                  <BossPostCard post={post} />
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn btn-outline"
                >
                  {loadingMore ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// Helper — GET /api/posts?bossId={id}&page={page}&size=12
async function apiGetPostsByBoss(bossId: number, page: number): Promise<Page<PostSummary>> {
  const { apiFetch } = await import("@/app/lib/api");
  return apiFetch(`/api/posts?bossId=${bossId}&page=${page}&size=12`);
}
