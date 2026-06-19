// DashboardPostCard — one post tile on the user's dashboard.
// createdAt is an ISO OffsetDateTime string from the backend (e.g. "2026-06-19T03:28:00+05:30").
// The Date constructor handles ISO strings with timezone offsets natively.

type DashboardPostCardProps = {
  postID: number;
  title: string;
  description: string;   // we pass stygianName here
  rating: number;        // averageRating, 0 if null
  createdAt: string;     // ISO OffsetDateTime string from backend
};

export default function DashboardPostCard({
  title,
  description,
  rating,
  createdAt,
}: DashboardPostCardProps) {
  // Format the ISO date string into something human-readable.
  // new Date() handles OffsetDateTime strings like "2026-06-19T03:28:00+05:30" correctly.
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="card-body gap-2">
        <h3 className="card-title text-lg line-clamp-1">{title}</h3>

        {/* stygianName passed as description */}
        <span className="badge badge-outline badge-sm">{description}</span>

        <div className="flex items-center justify-between text-sm opacity-70 mt-1">
          <span>{formattedDate}</span>
          <span>
            ⭐ {rating > 0 ? rating.toFixed(1) : "—"} / 5
          </span>
        </div>
      </div>
    </div>
  );
}
