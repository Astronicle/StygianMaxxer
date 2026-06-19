"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGetAccounts, type AccountSummary } from "@/app/lib/api";
import UserBrowseCard from "@/app/components/userBrowse/UserBrowseCard";

export default function UserBrowsePage() {
  const [users, setUsers] = useState<AccountSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // GET /api/accounts?page=0&size=24
        const data = await apiGetAccounts(0);
        setUsers(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await apiGetAccounts(nextPage);
      setUsers((prev) => [...prev, ...data.content]);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const hasMore = page < totalPages - 1;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="opacity-70">Browse all registered users</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {users.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {users.map((user) => (
              <Link key={user.accountId} href={`/user/${user.username}`}>
                <UserBrowseCard user={user} />
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
    </div>
  );
}
