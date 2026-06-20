import type { PostSummary } from "@/app/lib/api";

// BossPostCard — shown on the boss detail page for each post featuring that boss.
// Uses PostSummary, which is what GET /api/posts?bossId=... returns in its page content.

type BossPostCardProps = {
  post: PostSummary;
};

export default function BossPostCard({ post }: BossPostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="card-body gap-2">
        <h3 className="card-title text-lg line-clamp-1">{post.title}</h3>

        {/* Stygian version + difficulty */}
        <div className="flex items-center gap-2">
          <span className="badge badge-outline badge-sm">{post.stygianName}</span>
          <span
            className={`badge badge-sm font-semibold ${
              post.difficulty === "Dire" ? "badge-error" : "badge-warning"
            }`}
          >
            {post.difficulty}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-sm opacity-70">
          <span>By {post.username}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1 text-sm mt-1">
          <span>⭐</span>
          <span className="font-medium">
            {post.averageRating != null ? post.averageRating.toFixed(1) : "—"}
          </span>
          <span className="opacity-60">({post.ratingCount} ratings)</span>
        </div>
      </div>
    </div>
  );
}
