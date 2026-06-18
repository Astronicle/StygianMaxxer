"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetPosts, type PostSummary } from "../lib/api";
import PostBrowseCard from "../components/postBrowse/PostBrowseCard";

export default function PostBrowsePage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetPosts(0);
        // Replace posts entirely on first load
        setPosts(data.content);
        setTotalPages(data.totalPages);
        setPage(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load more — appends to the existing list rather than replacing it
  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await apiGetPosts(nextPage);
      setPosts((prev) => [...prev, ...data.content]);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  const hasMore = page < totalPages - 1;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="opacity-70">Browse all Stygian clear posts</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="alert alert-info">No posts yet — be the first!</div>
      ) : (
        <>
          {/* Horizontal scroll row — same layout as before */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {posts.map((post) => (
              <Link key={post.postId} href={`/post/${post.postId}`}>
                <PostBrowseCard {...post} />
              </Link>
            ))}
          </div>

          {/* Load more */}
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
    </div>
  );
}