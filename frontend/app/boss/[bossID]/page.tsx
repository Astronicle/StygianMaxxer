"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  apiGetPostsFiltered,
  type Boss,
  type PostFilterParams,
  type PostSummary,
} from "@/app/lib/api";
import type { AdvancedFilters as AF } from "@/app/components/filters/AdvancedFilterModal";
import AdvancedFilterModal from "@/app/components/filters/AdvancedFilterModal";
import BossDetailHeader from "@/app/components/boss/BossDetailHeader";
import BossPostCard from "@/app/components/boss/BossPostCard";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const PAGE_SIZE = 12;

// ─── Inline filter bar (image 1) ──────────────────────────────────────────────
// Shows: Advanced Filter ▾  |  Cost: [min]–[max]  |  Time: [min]–[max]

type QuickFilters = Pick<PostFilterParams, "minCost" | "maxCost" | "minTime" | "maxTime">;

function FilterBar({
  quick,
  onQuickChange,
  onAdvancedOpen,
  activeAdvancedCount,
}: {
  quick: QuickFilters;
  onQuickChange: (f: Partial<QuickFilters>) => void;
  onAdvancedOpen: () => void;
  activeAdvancedCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Advanced filter toggle */}
      <button
        type="button"
        className={`btn btn-sm gap-2 ${activeAdvancedCount > 0 ? "btn-primary" : "btn-outline"}`}
        onClick={onAdvancedOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Advanced Filter
        {activeAdvancedCount > 0 && (
          <span className="badge badge-xs badge-secondary">{activeAdvancedCount}</span>
        )}
      </button>

      {/* Quick: Cost range */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="opacity-70 font-medium">Cost:</span>
        <input
          type="number"
          min={0}
          placeholder="Min"
          className="input input-bordered input-xs w-16"
          value={quick.minCost ?? ""}
          onChange={(e) => onQuickChange({ minCost: e.target.value ? Number(e.target.value) : undefined })}
        />
        <span className="opacity-40">–</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          className="input input-bordered input-xs w-16"
          value={quick.maxCost ?? ""}
          onChange={(e) => onQuickChange({ maxCost: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>

      {/* Quick: Time range */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="opacity-70 font-medium">Time:</span>
        <input
          type="number"
          min={0}
          placeholder="Min"
          className="input input-bordered input-xs w-16"
          value={quick.minTime ?? ""}
          onChange={(e) => onQuickChange({ minTime: e.target.value ? Number(e.target.value) : undefined })}
        />
        <span className="opacity-40">–</span>
        <input
          type="number"
          min={0}
          placeholder="Max"
          className="input input-bordered input-xs w-16"
          value={quick.maxTime ?? ""}
          onChange={(e) => onQuickChange({ maxTime: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </div>
  );
}

// ─── Count active advanced filters ────────────────────────────────────────────

function countAdvanced(f: AF): number {
  let n = 0;
  if (f.difficulty)                   n++;
  if ((f.charInclude?.length ?? 0) > 0) n++;
  if ((f.charExclude?.length ?? 0) > 0) n++;
  return n;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BossDetailPage() {
  const { bossID } = useParams<{ bossID: string }>();
  const bossId = Number(bossID);

  const [boss, setBoss] = useState<Boss | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [quick, setQuick] = useState<QuickFilters>({});
  const [advanced, setAdvanced] = useState<AF>({});
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce ref for quick filter inputs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildParams(page: number): PostFilterParams {
    return {
      bossId,
      ...quick,
      ...advanced,
      page,
      size: PAGE_SIZE,
    };
  }

  async function fetchPage(params: PostFilterParams, append: boolean) {
    try {
      const data = await apiGetPostsFiltered(params);
      if (append) {
        setPosts((prev) => [...prev, ...data.content]);
      } else {
        setPosts(data.content);
        setCurrentPage(0);
      }
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    }
  }

  // Initial load: boss info + first page of posts
  useEffect(() => {
    async function load() {
      try {
        const { apiFetch } = await import("@/app/lib/api");
        const allBosses = await apiFetch<Boss[]>("/api/bosses");
        const found = allBosses.find((b) => b.id === bossId);
        if (!found) { setError("Boss not found"); return; }
        setBoss(found);
        await fetchPage({ bossId, page: 0, size: PAGE_SIZE }, false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load boss");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bossId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when quick filters change (debounced 400ms)
  useEffect(() => {
    if (loading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPage(buildParams(0), false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [quick]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleApplyAdvanced(f: AF) {
    setAdvanced(f);
    fetchPage({ bossId, ...quick, ...f, page: 0, size: PAGE_SIZE }, false);
  }

  async function handleLoadMore() {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    await fetchPage(buildParams(nextPage), true);
    setCurrentPage(nextPage);
    setLoadingMore(false);
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  if (error || !boss) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="alert alert-error">{error ?? "Boss not found"}</div>
    </div>
  );

  const hasMore = currentPage < totalPages - 1;
  const activeAdvancedCount = countAdvanced(advanced);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <BossDetailHeader
        name={boss.name}
        icon={`${BOSS_ICON_BASE}/${boss.slug}/model.webp`}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-semibold">Posts featuring {boss.name}</h2>
        </div>

        {/* Filter bar */}
        <FilterBar
          quick={quick}
          onQuickChange={(f) => setQuick((prev) => ({ ...prev, ...f }))}
          onAdvancedOpen={() => setModalOpen(true)}
          activeAdvancedCount={activeAdvancedCount}
        />

        {/* Results */}
        {posts.length === 0 ? (
          <div className="alert alert-info">No posts match the current filters.</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <Link key={post.postId} href={`/post/${post.postId}`}>
                  <BossPostCard post={post} highlightBossId={bossId} />
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
                  {loadingMore ? <span className="loading loading-spinner loading-sm" /> : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <AdvancedFilterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={handleApplyAdvanced}
        initial={advanced}
      />
    </div>
  );
}
