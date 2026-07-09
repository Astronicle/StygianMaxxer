"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { apiGetPosts, apiGetPostsFiltered, type PostSummary } from "../lib/api";
import PostBrowseCard from "../components/postBrowse/PostBrowseCard";

export default function PostBrowsePage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSearching = activeSearch.trim() !== "";

  async function fetchPage(pageNum: number, title: string, append: boolean) {
    try {
      const data = title.trim()
        ? await apiGetPostsFiltered({ titleSearch: title.trim(), page: pageNum, size: 12 })
        : await apiGetPosts(pageNum);
      setPosts((prev) => append ? [...prev, ...data.content] : data.content);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    }
  }

  // Initial load
  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchPage(0, "", false);
      setLoading(false);
    }
    load();
  }, []);

  // Debounced search — fires 350ms after the user stops typing
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setActiveSearch(value);
      setLoading(true);
      setError(null);
      await fetchPage(0, value, false);
      setLoading(false);
    }, 350);
  }, []);

  // Load more — respects current active search
  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    await fetchPage(nextPage, activeSearch, true);
    setLoadingMore(false);
  }

  const hasMore = page < totalPages - 1;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Posts</h1>
        <p className="opacity-70">Browse all Stygian clear posts</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          className="input input-bordered w-full pl-10"
          placeholder="Search posts by title…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none"
        />
        {searchInput && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs"
            onClick={() => handleSearchChange("")}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="alert alert-info">
          {isSearching
            ? `No posts found matching "${activeSearch}".`
            : "No posts yet — be the first!"}
        </div>
      ) : (
        <>
          {isSearching && (
            <p className="text-sm opacity-60">
              Showing results for <span className="font-medium">"{activeSearch}"</span>
            </p>
          )}
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <Link key={post.postId} href={`/post/${post.postId}`} className="block">
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
