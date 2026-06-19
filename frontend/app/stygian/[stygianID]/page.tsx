"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  apiGetStygian,
  apiGetPosts,
  type Stygian,
  type PostSummary,
  type Page,
} from "@/app/lib/api";
import StygianDetailHeader from "@/app/components/stygian/StygianDetailHeader";
import StygianPostCard from "@/app/components/stygian/StygianPostCard";

export default function StygianDetailPage() {
  const { stygianID } = useParams<{ stygianID: string }>();
  const stygianId = Number(stygianID);

  const [stygian, setStygian] = useState<Stygian | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch the stygian details AND its posts in parallel
        // GET /api/stygian/{id}  — returns { id, name, version, bosses[] }
        // GET /api/posts?stygianId={id}&page=0  — returns Page<PostSummary>
        const [stygianData, postsPage] = await Promise.all([
          apiGetStygian(stygianId),
          // Note: the PostController accepts stygianId as a Short query param
          apiGetPostsByStygian(stygianId, 0),
        ]);

        setStygian(stygianData);
        setPosts(postsPage.content);
        setTotalPages(postsPage.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Stygian");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [stygianId]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await apiGetPostsByStygian(stygianId, nextPage);
      setPosts((prev) => [...prev, ...data.content]);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more posts");
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

  if (error || !stygian) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error">{error ?? "Stygian not found"}</div>
      </div>
    );
  }

  const hasMore = page < totalPages - 1;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Header shows version and boss icons */}
      <StygianDetailHeader stygian={stygian} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Posts for {stygian.name} v{stygian.version}
        </h2>

        {posts.length === 0 ? (
          <div className="alert alert-info">No posts for this Stygian yet.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link key={post.postId} href={`/post/${post.postId}`}>
                  <StygianPostCard post={post} />
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

// Helper — GET /api/posts?stygianId={id}&page={page}&size=12
// The PostController accepts stygianId as a Short, so we pass it as a query param.
async function apiGetPostsByStygian(stygianId: number, page: number): Promise<Page<PostSummary>> {
  const { apiFetch } = await import("@/app/lib/api");
  return apiFetch(`/api/posts?stygianId=${stygianId}&page=${page}&size=12`);
}
