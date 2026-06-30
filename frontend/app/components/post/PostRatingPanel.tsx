"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiRatePost,
  apiGetMyRating,
  getToken,
  getCurrentAccountId,
  type RatingSummary,
} from "@/app/lib/api";
import RatingStars from "./RatingStars";

type PostRatingPanelProps = {
  postId: number;
  postOwnerId: number;
  initialSummary: RatingSummary;
};

export default function PostRatingPanel({
  postId,
  postOwnerId,
  initialSummary,
}: PostRatingPanelProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [loadingMyRating, setLoadingMyRating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = !!getToken();
  const isOwner = isLoggedIn && getCurrentAccountId() === postOwnerId;
  const canRate = isLoggedIn && !isOwner;

  // Pull the user's existing rating (if any) so the widget pre-fills instead
  // of looking unrated when they've already rated this post before.
  useEffect(() => {
    if (!canRate) return;
    let cancelled = false;

    async function load() {
      setLoadingMyRating(true);
      try {
        const existing = await apiGetMyRating(postId);
        if (!cancelled) setMyRating(existing);
      } catch {
        // Non-critical — widget just starts unrated if this fails.
      } finally {
        if (!cancelled) setLoadingMyRating(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [postId, canRate]);

  async function handleRate(value: number) {
    if (submitting) return;
    const previousRating = myRating;
    const previousSummary = summary;

    // Optimistic update — recompute the average locally so the UI feels
    // instant, then reconcile with the server's real numbers.
    setSubmitting(true);
    setError(null);
    setMyRating(value);
    setSummary((s) => {
      const count = previousRating == null ? s.count + 1 : s.count;
      const priorTotal = (s.average ?? 0) * s.count;
      const adjustedTotal =
        previousRating == null ? priorTotal + value : priorTotal - previousRating + value;
      return { average: count > 0 ? adjustedTotal / count : value, count };
    });

    try {
      await apiRatePost(postId, value);
    } catch (err) {
      // Roll back on failure.
      setMyRating(previousRating);
      setSummary(previousSummary);
      setError(err instanceof Error ? err.message : "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card bg-base-200">
      <div className="card-body gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <RatingStars rating={summary.average ?? 0} size="md" />
            <span className="font-semibold">
              {summary.average != null ? summary.average.toFixed(1) : "—"}
            </span>
            <span className="text-sm opacity-60">
              ({summary.count} {summary.count === 1 ? "rating" : "ratings"})
            </span>
          </div>
        </div>

        {/* Interactive widget / state messaging */}
        {!isLoggedIn ? (
          <p className="text-sm opacity-70">
            <Link href="/login" className="link link-primary">
              Log in
            </Link>{" "}
            to rate this clear.
          </p>
        ) : isOwner ? (
          <p className="text-sm opacity-60">You can&apos;t rate your own post.</p>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-70">Your rating:</span>
            <RatingStars
              rating={myRating ?? 0}
              size="lg"
              onRate={handleRate}
              disabled={loadingMyRating || submitting}
            />
            {myRating != null && (
              <span className="text-sm opacity-60">{myRating} / 5</span>
            )}
          </div>
        )}

        {error && <div className="alert alert-error text-sm py-2">{error}</div>}
      </div>
    </div>
  );
}
