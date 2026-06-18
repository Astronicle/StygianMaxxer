type PostBrowseCardProps = {
  postId: number;
  title: string;
  username: string;
  stygianName: string;
  averageRating: number | null;
  ratingCount: number;
  createdAt: string;
};

export default function PostBrowseCard({
  title,
  username,
  stygianName,
  averageRating,
  ratingCount,
  createdAt,
}: PostBrowseCardProps) {
  return (
    <div className="card bg-base-200 shadow-md min-w-72 shrink-0 hover:shadow-lg transition-shadow">
      <div className="card-body gap-3">
        <h3 className="card-title text-lg line-clamp-1">{title}</h3>

        {/* Stygian version badge */}
        <span className="badge badge-outline badge-sm">{stygianName}</span>

        <div className="flex flex-wrap gap-2 text-sm opacity-70">
          <span>By {username}</span>
          <span>•</span>
          <span>{new Date(createdAt).toDateString()}</span>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-1 text-sm">
          <span>⭐</span>
          <span className="font-medium">
            {averageRating != null ? averageRating.toFixed(1) : "—"}
          </span>
          <span className="opacity-60">({ratingCount} ratings)</span>
        </div>
      </div>
    </div>
  );
}