// DashboardPostCard — one post tile on the user's dashboard.
// createdAt is an ISO OffsetDateTime string from the backend (e.g. "2026-06-19T03:28:00+05:30").

"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import { apiDeletePost } from "@/app/lib/api";

type DashboardPostCardProps = {
  postID: number;
  title: string;
  description: string;   // stygianName
  difficulty: "Fearless" | "Dire";
  rating: number;        // averageRating, 0 if null
  createdAt: string;     // ISO OffsetDateTime string from backend
  onDeleted?: (postId: number) => void;
};

export default function DashboardPostCard({
  postID,
  title,
  description,
  difficulty,
  rating,
  createdAt,
  onDeleted,
}: DashboardPostCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDeletePost(postID);
      setConfirming(false);
      onDeleted?.(postID);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="card-body gap-2">
          {/* Title — clickable to post detail */}
          <Link href={`/post/${postID}`} className="hover:underline">
            <h3 className="card-title text-lg line-clamp-1">{title}</h3>
          </Link>

          {/* Stygian badge + difficulty */}
          <div className="flex items-center gap-2">
            <span className="badge badge-outline badge-sm">{description}</span>
            <span
              className={`badge badge-sm font-semibold ${
                difficulty === "Dire" ? "badge-error" : "badge-warning"
              }`}
            >
              {difficulty}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm opacity-70 mt-1">
            <span>{formattedDate}</span>
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-warning text-warning" />
              {rating > 0 ? rating.toFixed(1) : "—"} / 5
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-2">
            <Link href={`/post/${postID}/edit`} className="btn btn-xs btn-outline flex-1 gap-1">
              <Pencil size={12} /> Edit
            </Link>
            <button
              className="btn btn-xs btn-error btn-outline flex-1 gap-1"
              onClick={() => { setConfirming(true); setDeleteError(null); }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>

          {deleteError && (
            <p className="text-error text-xs mt-1">{deleteError}</p>
          )}
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirming && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete post?</h3>
            <p className="py-3 opacity-70">
              <span className="font-medium">{title}</span> will be permanently deleted.
              This cannot be undone.
            </p>
            {deleteError && (
              <div className="alert alert-error text-sm mb-3">{deleteError}</div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => { setConfirming(false); setDeleteError(null); }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <span className="loading loading-spinner loading-xs" /> : "Delete"}
              </button>
            </div>
          </div>
          {/* Backdrop closes the modal */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setConfirming(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}
