"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  apiGetStygian,
  apiGetPostsFiltered,
  type PostFilterParams,
  type PostSummary,
  type Stygian,
  type StygianBoss,
} from "@/app/lib/api";
import type { AdvancedFilters as AF } from "@/app/components/filters/AdvancedFilterModal";
import AdvancedFilterModal from "@/app/components/filters/AdvancedFilterModal";
import StygianDetailHeader from "@/app/components/stygian/StygianDetailHeader";
import StygianPostCard from "@/app/components/stygian/StygianPostCard";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";
const PAGE_SIZE = 12;

// ─── Count active advanced filters ────────────────────────────────────────────

function countAdvanced(f: AF): number {
  let n = 0;
  if (f.difficulty)                     n++;
  if ((f.charInclude?.length ?? 0) > 0) n++;
  if ((f.charExclude?.length ?? 0) > 0) n++;
  if (f.allBossesOnly)                  n++;
  return n;
}

// ─── Boss filter chip row ──────────────────────────────────────────────────────
// Lets user pick one boss at a time to scope posts to that boss (image 2 style
// but inline, not a modal, since stygians have few bosses).

function BossFilterRow({
  bosses,
  selectedBossId,
  onToggle,
}: {
  bosses: StygianBoss[];
  selectedBossId: number | undefined;
  onToggle: (id: number) => void;
}) {
  if (bosses.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {bosses.map((b) => {
        const active = selectedBossId === b.bossId;
        return (
          <button
            key={b.bossId}
            type="button"
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-sm transition-colors ${
              active
                ? "border-primary bg-primary/15 text-primary"
                : "border-base-content/20 hover:border-primary/50"
            }`}
            onClick={() => onToggle(b.bossId)}
          >
            <img
              src={`${BOSS_ICON_BASE}/${b.bossSlug}/model.webp`}
              alt={b.bossName}
              className="w-5 h-5 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span>{b.bossName}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

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

      <div className="flex items-center gap-1.5 text-sm">
        <span className="opacity-70 font-medium">Cost:</span>
        <input type="number" min={0} placeholder="Min" className="input input-bordered input-xs w-16"
          value={quick.minCost ?? ""}
          onChange={(e) => onQuickChange({ minCost: e.target.value ? Number(e.target.value) : undefined })} />
        <span className="opacity-40">–</span>
        <input type="number" min={0} placeholder="Max" className="input input-bordered input-xs w-16"
          value={quick.maxCost ?? ""}
          onChange={(e) => onQuickChange({ maxCost: e.target.value ? Number(e.target.value) : undefined })} />
      </div>

      <div className="flex items-center gap-1.5 text-sm">
        <span className="opacity-70 font-medium">Time:</span>
        <input type="number" min={0} placeholder="Min" className="input input-bordered input-xs w-16"
          value={quick.minTime ?? ""}
          onChange={(e) => onQuickChange({ minTime: e.target.value ? Number(e.target.value) : undefined })} />
        <span className="opacity-40">–</span>
        <input type="number" min={0} placeholder="Max" className="input input-bordered input-xs w-16"
          value={quick.maxTime ?? ""}
          onChange={(e) => onQuickChange({ maxTime: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StygianDetailPage() {
  const { stygianID } = useParams<{ stygianID: string }>();
  const stygianId = Number(stygianID);

  const [stygian, setStygian] = useState<Stygian | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedBossId, setSelectedBossId] = useState<number | undefined>();
  const [quick, setQuick] = useState<QuickFilters>({});
  const [advanced, setAdvanced] = useState<AF>({});
  const [modalOpen, setModalOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildParams(page: number): PostFilterParams {
    return {
      stygianId,
      bossId: selectedBossId,
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

  // Initial load
  useEffect(() => {
    async function load() {
      try {
        const [stygianData, postsPage] = await Promise.all([
          apiGetStygian(stygianId),
          apiGetPostsFiltered({ stygianId, page: 0, size: PAGE_SIZE }),
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
  }, [stygianId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch on quick filter change (debounced)
  useEffect(() => {
    if (loading) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPage(buildParams(0), false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [quick]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleBossToggle(id: number) {
    const newBossId = selectedBossId === id ? undefined : id;
    setSelectedBossId(newBossId);
    fetchPage({ stygianId, bossId: newBossId, ...quick, ...advanced, page: 0, size: PAGE_SIZE }, false);
  }

  function handleApplyAdvanced(f: AF) {
    setAdvanced(f);
    fetchPage({ stygianId, bossId: selectedBossId, ...quick, ...f, page: 0, size: PAGE_SIZE }, false);
  }

  async function handleLoadMore() {
    const next = currentPage + 1;
    setLoadingMore(true);
    await fetchPage(buildParams(next), true);
    setCurrentPage(next);
    setLoadingMore(false);
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );

  if (error || !stygian) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="alert alert-error">{error ?? "Stygian not found"}</div>
    </div>
  );

  const hasMore = currentPage < totalPages - 1;
  const activeAdvancedCount = countAdvanced(advanced);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <StygianDetailHeader stygian={stygian} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Posts for {stygian.name} v{stygian.version}
        </h2>

        {/* Boss filter chips */}
        {stygian.bosses.length > 0 && (
          <div>
            <p className="text-xs opacity-50 mb-1.5">Filter by boss</p>
            <BossFilterRow
              bosses={stygian.bosses}
              selectedBossId={selectedBossId}
              onToggle={handleBossToggle}
            />
          </div>
        )}

        {/* Quick + Advanced filter bar */}
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
                <Link key={post.postId} href={`/post/${post.postId}`} className="h-full">
                  <StygianPostCard post={post} highlightBossId={selectedBossId} />
                </Link>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button onClick={handleLoadMore} disabled={loadingMore} className="btn btn-outline">
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
        stygianBosses={stygian.bosses}
      />
    </div>
  );
}
