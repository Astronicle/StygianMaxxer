import type { PostSummary } from "@/app/lib/api";

// StygianPostCard — post card shown on the stygian detail page.
// PostSummary from the backend: { postId, title, username, stygianName, createdAt, averageRating, ratingCount }
// Note: PostSummary does NOT include boss icons — only the full PostDetail (from GET /api/posts/{id}) does.
// So we show text boss info only here; the card links to the full post for details.

type StygianPostCardProps = {
  post: PostSummary;
};

export default function StygianPostCard({ post }: StygianPostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
      <div className="card-body gap-3">
        <h3 className="card-title text-lg line-clamp-1">{post.title}</h3>

        {/* stygianName badge — confirms which cycle this post belongs to */}
        <span className="badge badge-outline badge-sm">{post.stygianName}</span>

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
