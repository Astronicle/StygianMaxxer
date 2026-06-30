"use client";

import { useEffect, useState } from "react";
import { apiGetPostBosses, type Boss, type PostSummary } from "@/app/lib/api";

const BOSS_ICON_BASE = process.env.NEXT_PUBLIC_BOSS_ICON_BASE_URL ?? "";

type PostCardProps = {
  post: PostSummary;
};

export default function PostCard({ post }: PostCardProps) {
  const [bosses, setBosses] = useState<Boss[]>([]);

  useEffect(() => {
    let cancelled = false;

    // GET /api/posts/{postId}/bosses — bosses killed in this post, for icons
    apiGetPostBosses(post.postId)
      .then((data) => {
        if (!cancelled) setBosses(data);
      })
      .catch(() => {
        // Non-critical — card still renders fine without boss icons
      });

    return () => {
      cancelled = true;
    };
  }, [post.postId]);

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
      <div className="card-body p-4">
        <h3 className="card-title text-lg line-clamp-1">{post.title}</h3>

        <p className="text-sm opacity-70">Stygian: {post.stygianName}</p>

        {bosses.length > 0 && (
          <div className="flex gap-2 mt-3">
            {bosses.map((boss) => (
              <div key={boss.id} className="tooltip" data-tip={boss.name}>
                <img
                  src={`${BOSS_ICON_BASE}/${boss.slug}/model.webp`}
                  alt={boss.name}
                  className="w-10 h-10 rounded-md object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
